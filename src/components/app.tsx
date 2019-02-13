import * as React from "react";
import * as ReactModal from "react-modal";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";
import { SensorConfiguration, gNullSensorConfig } from "../models/sensor-configuration";
import { SensorConfigColumnInfo } from "@concord-consortium/sensor-connector-interface";
import GraphsPanel from "./graphs-panel";
import { ControlPanel } from "./control-panel";
import { Codap } from "../models/codap";
import { IStringMap, SensorStrings, SensorDefinitions } from "../models/sensor-definitions";
import { SensorManager, NewSensorData, ConnectableSensorManager } from "../models/sensor-manager";
import SmartFocusHighlight from "../utils/smart-focus-highlight";
import { find, pull, sumBy } from "lodash";
import Button from "./smart-highlight-button";
import { SensorConnectorManager } from "../models/sensor-connector-manager";


export interface AppProps {
    sensorManager?: SensorManager;
}

export interface AppState {
    sensorConfig:SensorConfiguration | null;
    sensorSlots:SensorSlot[];
    hasData:boolean;
    dataChanged:boolean;
    dataReset:boolean;
    collecting:boolean;
    runLength:number;
    timeUnit:string;
    notRespondingModal:boolean;
    suppressNotRespondingModal:boolean;
    warnNewModal:boolean;
    reconnectModal:boolean;
    statusMessage:string|undefined;
    secondGraph:boolean;
    xStart:number;
    xEnd:number;
}

function newSensorFromDataColumn(dataColumn:SensorConfigColumnInfo) {
    let newSensor = new Sensor();
    newSensor.columnID = dataColumn.id;
    newSensor.sensorPosition = dataColumn.position;
    newSensor.valueUnit = dataColumn.units;
    newSensor.definition = SensorDefinitions[dataColumn.units];
    return newSensor;
}

function matchSensorsToDataColumns(slots:SensorSlot[], dataColumns:SensorConfigColumnInfo[]|null) {
    let matched:Array<Sensor|null> = [null, null],
        columns = dataColumns && dataColumns.slice() || [];

    function matchSensors(test: (c:SensorConfigColumnInfo, s:Sensor) => boolean) {
        matched.forEach((sensor:Sensor|null, index) => {
            let found;
            if (!matched[index]) {
                found = find(columns, (c) => test(c, slots[index].sensor));
                if (found) {
                    matched[index] = newSensorFromDataColumn(found);
                    // remove matched column so it can't be matched again
                    pull(columns, found);
                }
            }
        });
        return matched[0] && matched[1];
    }

    function findBestSensorMatch() {
        // match by column ID
        if (matchSensors((c:SensorConfigColumnInfo, s:Sensor) => c.id === s.columnID)) return;
        // match by sensor position (as long as units are compatible)
        if (matchSensors((c:SensorConfigColumnInfo, s:Sensor) =>
                        (c.position === s.sensorPosition) && (c.units === s.valueUnit))) return;
        // match by units (independent of position)
        if (matchSensors((c:SensorConfigColumnInfo, s:Sensor) => c.units === s.valueUnit)) return;
        // match by position (independent of units)
        if (matchSensors((c:SensorConfigColumnInfo, s:Sensor) => c.position === s.sensorPosition)) return;
        // last resort - match whatever's available
        if (matchSensors((c:SensorConfigColumnInfo, s:Sensor) => true)) return;
    }

    findBestSensorMatch();

    // if only one sensor, put it in the first slot
    if (!matched[0] && matched[1]) {
        matched[0] = matched[1];
        matched[1] = null;
    }

    // update slots with matched sensors; clear unmatched sensors
    matched.forEach((s:Sensor|null, i) => {
        slots[i].setSensor(s || new Sensor());
    });
    return slots;
}

// Typescript type guard
function isConnectableSensorManager(manager: ConnectableSensorManager | any) :
    manager is ConnectableSensorManager {
  return manager && (manager as ConnectableSensorManager).connectToDevice !== undefined;
}

const SLEEP_WAKE_DELAY_SEC = 3;

// We don't have the ability to control the sampling rate. To avoid sending down
// overly large chunks of data, we down-sample long-duration experiments.
// The following values represent the thresholds above which down-sampling occurs.
// At 10 samples/sec, a 60-sec collection generates 601 points.
const DOWN_SAMPLE_THRESHOLD_SECS = 60;
const DOWN_SAMPLE_THRESHOLD_COUNT = 601;

const tagIdentifier = 0xaa80; // used to identify sensor tag
const goDirectPrefix = "GDX"; // used to identify go direct sensors
interface ISensorAddrs {
  service: string;
  data: string;
  config: string;
}

const tagAddrs: { [index:string] : ISensorAddrs } = {
  luxometer: {
    service: 'f000aa70-0451-4000-b000-000000000000',
    data: 'f000aa71-0451-4000-b000-000000000000',
    config: 'f000aa72-0451-4000-b000-000000000000'
  },
  humidity: {
    service: 'f000aa20-0451-4000-b000-000000000000',
    data: 'f000aa21-0451-4000-b000-000000000000', // TempLSB:TempMSB:HumidityLSB:HumidityMSB
    config: 'f000aa22-0451-4000-b000-000000000000'
  },
  IRTemperature: {
    service: 'f000aa00-0451-4000-b000-000000000000',
    data: 'f000aa01-0451-4000-b000-000000000000', // ObjectLSB:ObjectMSB:AmbientLSB:AmbientMSB
    config: 'f000aa02-0451-4000-b000-000000000000'
  },
  IO: {
    service: 'f000aa64-0451-4000-b000-000000000000',
    data: 'f000aa65-0451-4000-b000-000000000000',
    config: 'f000aa66-0451-4000-b000-000000000000'
  }
};

export class App extends React.Component<AppProps, AppState> {

    private messages:IStringMap;
    private codap:Codap;
    private selectionRange:{start:number,end:number|undefined} = {start:0,end:undefined};
    private disableWarning:boolean = false;
    private isReloading:boolean = false;
    private columnInfoCache: { [columnID: string]: SensorConfigColumnInfo[]; } = {};
    private currentSensorManager: SensorManager;
    // tslint:disable-next-line
    private wirelessDevice: any;
    private wirelessServer: any;

    constructor(props: AppProps) {
        super(props);

        this.state = {
            sensorConfig:null,
            sensorSlots:[new SensorSlot(0, new Sensor()), new SensorSlot(1, new Sensor())],
            hasData:false,
            dataChanged:false,
            dataReset:false,
            collecting:false,
            runLength:5,
            xStart:0,
            xEnd:5.01, // without the .01, last tick number sometimes fails to display
            timeUnit:"",
            notRespondingModal:false,
            suppressNotRespondingModal:false,
            warnNewModal:false,
            reconnectModal:false,
            statusMessage:undefined,
            secondGraph:false
        };

        this.messages = SensorStrings.messages as IStringMap;
        this.connectCodap = this.connectCodap.bind(this);

        this.onSensorConnect = this.onSensorConnect.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        this.onSensorStatus = this.onSensorStatus.bind(this);
        this.onSensorCollectionStopped = this.onSensorCollectionStopped.bind(this);

        setTimeout(this.connectCodap, 1000);

        this.onTimeSelect = this.onTimeSelect.bind(this);
        this.onGraphZoom = this.onGraphZoom.bind(this);
        this.startSensor = this.startSensor.bind(this);
        this.stopSensor = this.stopSensor.bind(this);
        this.sendData = this.sendData.bind(this);
        this.checkNewData = this.checkNewData.bind(this);
        this.closeWarnNewModal = this.closeWarnNewModal.bind(this);
        this.tryReconnectModal = this.tryReconnectModal.bind(this);
        this.discardData = this.discardData.bind(this);
        this.toggleWarning = this.toggleWarning.bind(this);
        this.toggleGraph = this.toggleGraph.bind(this);
        this.reload = this.reload.bind(this);
    }

    componentDidMount() {
        SmartFocusHighlight.enableFocusHighlightOnKeyDown();
    }

    connectCodap() {
        this.codap = new Codap((initialState:any) => {
            // merge saved initial state into current state
            this.setState(initialState);
            if (initialState && (initialState.runLength != null))
                this.setXZoomState(initialState.runLength);
        });
    }

    setStatusInterfaceConnected(interfaceType: string) {
        const connectMessage = this.messages["interface_connected"]
                                   .replace('__interface__', interfaceType || ""),
              noSensorsMessage = this.connectedSensorCount() === 0
                                    ? ` -- ${this.messages['no_sensors']}` : "",
              collectMessage = this.state.collecting ? ` -- ${this.messages['collecting_data']}` : "",
              message = connectMessage + (noSensorsMessage || collectMessage);
        this.setState({ statusMessage: message });
    }

    onSensorConnect(sensorConfig:SensorConfiguration) {
        const interfaceType = sensorConfig.interface;
        let sensorSlots = this.state.sensorSlots;

        if (this.isReloading) { return; }

        if(!sensorConfig.hasInterface) {
            sensorSlots = matchSensorsToDataColumns(sensorSlots, null);
            this.setState({
                sensorConfig: null,
                sensorSlots,
                statusMessage: this.messages["no_sensors"]
            });
        }
        else {
            this.setStatusInterfaceConnected(interfaceType || "");

            const timeUnit = sensorConfig.timeUnit || "",
                  dataColumns = sensorConfig.dataColumns;

            sensorSlots = matchSensorsToDataColumns(sensorSlots, dataColumns || null);

            this.setState({ sensorConfig, sensorSlots, timeUnit });
        }
    }

    handleSensorSelect = (sensorIndex:number, columnID:string) => {
        let { sensorSlots } = this.state,
            sensors = sensorSlots.map((slot) => slot.sensor);
        // if same sensor selected, there's nothing to do
        if (sensorSlots[sensorIndex].sensor.columnID === columnID) return;
        // if the other graphed sensor is selected, just switch them
        const otherIndex = 1 - sensorIndex;
        if (sensors[otherIndex].columnID === columnID) {
            sensorSlots.forEach((slot, i) => { slot.sensor = sensors[1-i]; });
        }
        // if a third sensor is selected, configure the new sensor
        else {
            const sensorConfig = this.state.sensorConfig,
                  dataColumn = sensorConfig && sensorConfig.getColumnByID(columnID),
                  newSensor = dataColumn
                                ? newSensorFromDataColumn(dataColumn)
                                : new Sensor();
            sensorSlots[sensorIndex].setSensor(newSensor);
        }
        this.setState({ sensorSlots });
    }

    startWiredConnecting = () => {
        this.currentSensorManager = new SensorConnectorManager();
        this.currentSensorManager.addListener('onSensorConnect', this.onSensorConnect);
        this.currentSensorManager.addListener('onSensorData', this.onSensorData);
        this.currentSensorManager.addListener('onSensorStatus', this.onSensorStatus);
        this.currentSensorManager.addListener('onCommunicationError', this.onCommunicationError);
        this.currentSensorManager.startPolling();
    }

    startWirelessConnecting = () => {
        this.chooseWirelessDevice();
    }

    async chooseWirelessDevice() {
        // Step 1: ask for a device
        console.log("Displaying matching wireless devices...");
        this.wirelessDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: [tagIdentifier] },
                      {namePrefix: goDirectPrefix}
          ],
            optionalServices: [tagAddrs.luxometer.service,
                               tagAddrs.humidity.service,
                               tagAddrs.IRTemperature.service,
                               tagAddrs.IO.service]
          });

        // Step 2: Connect to device
        console.log("Connecting to wireless device...");
        this.wirelessServer = await this.wirelessDevice.gatt.connect();

        // Get the IO service
        console.log("Requesting primary service...");
        const wirelessService =
            await this.wirelessServer.getPrimaryService(tagAddrs.IO.service);

        console.log(wirelessService);
    }

    startConnecting = () => {
        this.currentSensorManager.requestWake();
    }

    startSensor() {
        this.currentSensorManager.requestStart();
        this.setState({
            statusMessage: this.messages["starting_data_collection"]
        });
    }

    stopSensor() {
        this.currentSensorManager.requestStop();
    }

    onSensorCollectionStopped() {
        this.setState({
            collecting: false,
            statusMessage: this.messages["data_collection_stopped"]
        });
        this.currentSensorManager.removeListener('onSensorCollectionStopped',
          this.onSensorCollectionStopped);
    }

    // This should only be called while we are collecting
    onSensorData(newSensorData: NewSensorData) {
        if(!this.state.collecting) {
            this.setState({
                hasData: true,
                dataChanged: true,
                collecting: true,
                statusMessage: this.messages["collecting_data"]
            });
            this.currentSensorManager.addListener('onSensorCollectionStopped',
              this.onSensorCollectionStopped);
        }

        const { sensorSlots } = this.state;

        // Keep track of the smallest last time value. We want to keep collecting
        // until all of the sensors have reached the runLength.
        let lastTime = Number.MAX_SAFE_INTEGER,
            newSensorDataArrived = false;

        sensorSlots.forEach((sensorSlot) => {
          const sensor = sensorSlot.sensor,
              sensorData = sensor && sensor.columnID && newSensorData[sensor.columnID];
          if(!sensor || !sensor.columnID) {
            // This sensorSlot is empty (I hope)
            return;
          }

          if(!sensorData) {
            // The sensorSlot is not empty. Just newData doesn't contain any data
            // for this sensor
            lastTime = Math.min(lastTime, sensorSlot.timeOfLastData);
            return;
          }

          sensorSlot.appendData(sensorData, this.state.runLength);
          newSensorDataArrived = true;

          lastTime = Math.min(lastTime, sensorSlot.timeOfLastData);
        });

        if (newSensorDataArrived) {
          this.setState({ hasData: true, dataChanged: true,
              sensorSlots: this.state.sensorSlots });
        }

        if(lastTime !== Number.MAX_SAFE_INTEGER && lastTime >= this.state.runLength) {
            this.stopSensor();
        }
    }

    onSensorStatus(sensorConfig:SensorConfiguration) {
        const { sensorSlots } = this.state;

        sensorSlots.forEach((sensorSlot) => {
          const { sensor } = sensorSlot,
              columnID = sensor.columnID,
              dataColumn = columnID && sensorConfig.getColumnByID(columnID),
              liveValue = dataColumn ? Number(dataColumn.liveValue) : undefined;

          sensor.sensorValue = liveValue;

          // Under some circumstances, SensorConnector application gets stuck
          // such that it stops talking to the sensor (e.g. motion sensors
          // stop clicking) and just responds with the last collected value.
          // If we see five responses with the same value and time stamp, we
          // assume that the SensorConnector has gotten stuck.
          if (columnID && dataColumn) {
            let cache = this.columnInfoCache[columnID];
            if (!cache) {
                cache = this.columnInfoCache[columnID] = [];
            }
            cache.push(dataColumn);
            let stuck = false;
            if (cache.length > 4) {
                stuck = true;
                for (let i = 1; i < cache.length; ++i) {
                    if ((cache[i].liveValue !== cache[0].liveValue) ||
                        (cache[i].liveValueTimeStamp !== cache[0].liveValueTimeStamp)) {
                        stuck = false;
                        break;
                    }
                }
                cache.splice(0, 1);
            }
            if (stuck) {
                // disable for the time being as it generates false positives
                // this.setState({ statusMessage: this.messages["appears_stuck"] });
                console.log(`SensorConnector appears stuck!`);
            }
            else {
                this.setStatusInterfaceConnected(sensorConfig.interface || "");
                this.setState({ suppressNotRespondingModal: false });
            }
          }
          if(liveValue == null) {
            // This sensor isn't active any more - onSensorConnect should have been or
            // will be called. That function's slot matcher will disable the sensor.
          }
        });

        this.setState({ sensorConfig, sensorSlots: this.state.sensorSlots });
    }

    onCommunicationError = () => {
        this.onSensorConnect(gNullSensorConfig);
        if (!this.isReloading) {
            this.setState({ statusMessage: this.messages["not_responding"] });
        }
        if (!this.state.suppressNotRespondingModal) {
            this.setState({ notRespondingModal: true, suppressNotRespondingModal: true });
        }
    }

    connectedSensorCount() {
        return sumBy(this.state.sensorSlots, (slot) => slot.isConnected ? 1 : 0);
    }

    hasData() {
        const { sensorSlots } = this.state;
        return sensorSlots.some((slot) => slot.sensorData && (slot.sensorData.length > 0));
    }

    downSample(data: number[][]) {
        const shouldDownSample = (this.state.runLength > DOWN_SAMPLE_THRESHOLD_SECS) &&
                                    (data.length > DOWN_SAMPLE_THRESHOLD_COUNT);

        if (!shouldDownSample) { return data; }

        let downSampleRate = 1;
        while ((data.length - 1) / downSampleRate > (DOWN_SAMPLE_THRESHOLD_COUNT - 1)) {
            ++ downSampleRate;
        }
        return data.filter((d: number[], i: number) => {
                        // interval sampling plus always include the last sample
                        return (i % downSampleRate === 0) || (i === data.length - 1);
                    });
    }

    sendData() {
        const { sensorSlots, secondGraph } = this.state,
              sendSecondSensorData = secondGraph && sensorSlots[1].hasData;
        const dataSpecs = sensorSlots.map((slot, i) => {
            const sensor = slot.sensorForData,
                  name = sensor && sensor.definition.measurementName,
                  position = (sensor && sensor.sensorPosition) || i+1,
                  data = slot.sensorData.slice(this.selectionRange.start, this.selectionRange.end);
            return {
                name: sendSecondSensorData ? `${name}_${position}` : name,
                unit: sensor ? sensor.valueUnit : '',
                data: this.downSample(data)
            };
        });
        if (!sendSecondSensorData) {
            this.codap.sendData(dataSpecs[0]);
        }
        else {
            this.codap.sendDualData(dataSpecs);
        }

        this.setState({
            dataChanged: false
        });
    }

    checkNewData() {
        if(this.state.dataChanged && !this.disableWarning) {
            this.setState({
               warnNewModal: true
            });
        } else {
            this.newData();
        }
    }

    newData() {
        const { sensorSlots, runLength } = this.state;
        sensorSlots.forEach((slot) => slot.clearData());
        this.setState({
            hasData:false,
            dataReset:true,
            dataChanged:false
        });
        this.setXZoomState(runLength);
    }

    setXZoomState(runLength:number) {
        this.setState({
            xStart: 0,
            // without the .01, last tick number sometimes fails to display
            xEnd: runLength + 0.01
        });
    }

    onTimeSelect(newTime:number) {
        this.setState({
            runLength: newTime
        });
        this.setXZoomState(newTime);
        this.codap.updateInteractiveState({ runLength: newTime });
    }

    onGraphZoom(xStart:number, xEnd:number) {
        const sensor1Data = this.state.sensorSlots[0].sensorData;
        const { xStart: prevXStart, xEnd: prevXEnd } = this.state;

        // bail if no change
        if ((prevXStart === xStart) && (prevXEnd === xEnd)) return;

        // convert from time value to index
        var i:number, entry:number[], nextEntry:number[];
        for(i=0; i < sensor1Data.length-1; i++) {
            entry = sensor1Data[i];
            nextEntry = sensor1Data[i+1];
            if(entry[0] === xStart) {
                this.selectionRange.start = i;
                break;
            } else if(entry[0] < xStart && nextEntry[0] >= xStart) {
                this.selectionRange.start = i+1;
                break;
            }
        }
        for(i; i < sensor1Data.length-1; i++) {
            entry = sensor1Data[i];
            nextEntry = sensor1Data[i+1];
            if(entry[0] > xEnd) {
                this.selectionRange.end = i;
                break;
            }
            else if(i === sensor1Data.length-1) {
                this.selectionRange.end = i + 1;
                break;
            }
        }

        this.setState({
            xStart: xStart,
            xEnd: xEnd,
            dataChanged: true
        });
    }

    dismissNotRespondingModal = () => {
        this.setState({ notRespondingModal: false });
    }

    launchSensorConnector = () => {
        this.setState({ statusMessage: "Launching SensorConnector...", notRespondingModal: false });
        this.currentSensorManager.requestSleep();
        // pause before attempting to reload SensorConnector
        setTimeout(() => this.currentSensorManager.requestWake(), SLEEP_WAKE_DELAY_SEC * 1000);
    }

    closeWarnNewModal() {
        this.setState({
            warnNewModal: false
        });
    }

    discardData() {
        this.closeWarnNewModal();
        this.newData();
    }

    tryReconnectModal() {
        this.setState({
            reconnectModal: false
        });

        if(this.state.sensorConfig != null) {
            this.onSensorConnect(this.state.sensorConfig);
        }
    }

    toggleWarning() {
        this.disableWarning = true;
    }

    toggleGraph() {
        const secondGraph = !this.state.secondGraph;
        this.setState({ secondGraph });
        this.codap.updateInteractiveState({ secondGraph });
    }

    reload() {
        this.isReloading = true;
        this.setState({ statusMessage: "Reloading SensorConnector..."});
        this.currentSensorManager.requestSleep();
        // pause before attempting to reload page
        setTimeout(() => location.reload(), SLEEP_WAKE_DELAY_SEC * 1000);
    }

    componentDidUpdate(prevProps:AppProps, prevState:AppState) {
        if(!prevState.dataReset && this.state.dataReset) {
            this.setState({
                dataReset:false
            });
        }
    }

    connectToDevice = () => {
      if(isConnectableSensorManager(this.currentSensorManager)){
        this.currentSensorManager.connectToDevice();
      }
    }

    disconnectFromDevice = () => {
      if(isConnectableSensorManager(this.currentSensorManager)){
        this.currentSensorManager.disconnectFromDevice();
      }
    }

    renderConnectToDeviceButton() {
      // Check if this sensorManger supports device connection
      if(isConnectableSensorManager(this.currentSensorManager)) {
        if(this.currentSensorManager.deviceConnected){
          return  <Button className="connect-to-device-button" onClick={this.disconnectFromDevice} >
                    Disconnect from Device
                  </Button>;
        } else {
          return  <Button className="connect-to-device-button" onClick={this.connectToDevice} >
                    Connect to Device
                  </Button>;
        }

      } else {
        return null;
      }
    }

    renderDualCollectionCheckBox() {
      if(this.currentSensorManager && this.currentSensorManager.supportsDualCollection) {
        return <label className="two-sensors-checkbox">
            <input type="checkbox"
                id="toggleGraphBtn"
                checked={this.state.secondGraph}
                onClick={this.toggleGraph} />
            Two sensors
        </label>;
      } else {
        return null;
      }
    }

    render() {
        var { sensorConfig } = this.state,
            codapURL = window.self === window.top
                        ? "http://codap.concord.org/releases/latest?di=" + window.location.href
                        : "",
            interfaceType = (sensorConfig && sensorConfig.interface) || "";
        return (
            <div className="app-container">
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="SensorConnector not responding"
                            isOpen={this.state.notRespondingModal} >
                    <p>{this.messages["sensor_connector_not_responding"]}</p>
                    <hr/>
                    <button onClick={this.launchSensorConnector}>Launch SensorConnector</button>
                    <button onClick={this.dismissNotRespondingModal}>Dismiss</button>
                </ReactModal>
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="Discard data?"
                            isOpen={this.state.warnNewModal} >
                    <p>{this.messages["check_save"]}</p>
                    <label>
                        <input type="checkbox" onChange={this.toggleWarning}/>
                        Don't show this message again
                    </label>
                    <hr/>
                    <button onClick={this.closeWarnNewModal}>Preserve Data</button>
                    <button onClick={this.discardData}>Discard Data</button>
                </ReactModal>
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="Sensor not attached"
                            isOpen={this.state.reconnectModal} >
                    <p>{this.messages["sensor_not_attached"]}</p>
                    <hr/>
                    <button onClick={this.tryReconnectModal}>Try again</button>
                </ReactModal>
                <div className="app-content">
                    <div className="app-top-bar">
                        {this.renderDualCollectionCheckBox()}
                        <div className="status-message">
                            {this.state.statusMessage || "\xA0"}
                        </div>
                        <div>
                            <button className="connect-to-device-button smart-focus-highlight disable-focus-highlight"
                                    onClick={this.startWiredConnecting}>Connect to Wired</button>
                            <button className="connect-to-device-button smart-focus-highlight disable-focus-highlight"
                                    onClick={this.startWirelessConnecting}>Connect to Wireless</button>
                        </div>
                        {this.renderConnectToDeviceButton()}
                    </div>
                    <GraphsPanel
                        sensorConfig={this.state.sensorConfig}
                        sensorSlots={this.state.sensorSlots}
                        secondGraph={this.state.secondGraph}
                        onGraphZoom={this.onGraphZoom}
                        onSensorSelect={this.handleSensorSelect}
                        xStart={this.state.xStart}
                        xEnd={this.state.xEnd}
                        timeUnit={this.state.timeUnit}
                        collecting={this.state.collecting}
                        hasData={this.hasData()}
                        dataReset={this.state.dataReset}
                    />
                </div>
                <ControlPanel
                    isConnectorAwake={true} //isConnectorAwake={this.props.sensorManager.isAwake()}
                    interfaceType={interfaceType}
                    sensorCount={this.connectedSensorCount()}
                    collecting={this.state.collecting}
                    hasData={this.state.hasData}
                    dataChanged={this.state.dataChanged}
                    duration={this.state.runLength} durationUnit="s"
                    durationOptions={[1, 5, 10, 15, 20, 30, 45, 60, 300, 600, 900, 1200, 1800]}
                    embedInCodapUrl={codapURL}
                    onDurationChange={this.onTimeSelect}
                    onStartConnecting={this.startConnecting}
                    onStartCollecting={this.startSensor}
                    onStopCollecting={this.stopSensor}
                    onNewRun={this.checkNewData}
                    onSaveData={this.sendData}
                    onReloadPage={this.reload}
                />
            </div>
        );
    }

}
