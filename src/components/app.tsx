import * as React from "react";
import ReactModal from "react-modal";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";
import { SensorConfiguration, gNullSensorConfig } from "../models/sensor-configuration";
import { ISensorConfigColumnInfo } from "../models/sensor-connector-interface";
import GraphsPanel from "./graphs-panel";
import { ControlPanel } from "./control-panel";
import { Codap } from "../models/codap";
import { IStringMap, SensorStrings, SensorDefinitions } from "../models/sensor-definitions";
import { SensorManager, NewSensorData, ConnectableSensorManager } from "../models/sensor-manager";
import SmartFocusHighlight from "../utils/smart-focus-highlight";
import { find, pull } from "lodash";
import Button from "./smart-highlight-button";


export interface AppProps {
    sensorManager: SensorManager;
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
    warnNewModal:boolean;
    reconnectModal:boolean;
    statusMessage:string|undefined;
    secondGraph:boolean;
    xStart:number;
    xEnd:number;
}

function newSensorFromDataColumn(dataColumn:ISensorConfigColumnInfo) {
    let newSensor = new Sensor();
    newSensor.columnID = dataColumn.id;
    newSensor.sensorPosition = dataColumn.position;
    newSensor.valueUnit = dataColumn.units;
    newSensor.definition = SensorDefinitions[dataColumn.units];
    return newSensor;
}

function matchSensorsToDataColumns(slots:SensorSlot[], dataColumns:ISensorConfigColumnInfo[]|null) {
    let matched:Array<Sensor|null> = [null, null],
        columns = dataColumns && dataColumns.slice() || [];

    function matchSensors(test: (c:ISensorConfigColumnInfo, s:Sensor) => boolean) {
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
        if (matchSensors((c:ISensorConfigColumnInfo, s:Sensor) => c.id === s.columnID)) return;
        // match by sensor position (as long as units are compatible)
        if (matchSensors((c:ISensorConfigColumnInfo, s:Sensor) =>
                        (c.position === s.sensorPosition) && (c.units === s.valueUnit))) return;
        // match by units (independent of position)
        if (matchSensors((c:ISensorConfigColumnInfo, s:Sensor) => c.units === s.valueUnit)) return;
        // match by position (independent of units)
        if (matchSensors((c:ISensorConfigColumnInfo, s:Sensor) => c.position === s.sensorPosition)) return;
        // last resort - match whatever's available
        if (matchSensors((c:ISensorConfigColumnInfo, s:Sensor) => true)) return;
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

export class App extends React.Component<AppProps, AppState> {

    private messages:IStringMap;
    private codap:Codap;
    private selectionRange:{start:number,end:number|undefined} = {start:0,end:undefined};
    private disableWarning:boolean = false;
    private isReloading:boolean = false;

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

        let sensorManager = this.props.sensorManager;
        sensorManager.addListener('onSensorConnect', this.onSensorConnect);
        sensorManager.addListener('onSensorData', this.onSensorData);
        sensorManager.addListener('onSensorStatus', this.onSensorStatus);
        sensorManager.addListener('onCommunicationError', this.onCommunicationError);
        this.props.sensorManager.startPolling();

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
        });
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
            console.log("interface connected: " + interfaceType);

            this.setState({
                statusMessage: ""
            });

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

    startSensor() {
        this.props.sensorManager.requestStart();
        this.setState({
            statusMessage: this.messages["starting_data_collection"]
        });
    }

    stopSensor() {
        this.props.sensorManager.requestStop();
    }

    onSensorCollectionStopped() {
        this.setState({
            collecting: false,
            statusMessage: this.messages["data_collection_stopped"]
        });

        this.props.sensorManager.removeListener('onSensorCollectionStopped',
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

            this.props.sensorManager.addListener('onSensorCollectionStopped',
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

          if(liveValue == null) {
            // This sensor isn't active anymore onSensorConnect should have been or
            // will be called. That functions slot matcher will disable the sensor
          }
        });

        this.setState({ sensorConfig, sensorSlots: this.state.sensorSlots });
    }

    onCommunicationError = () => {
        this.onSensorConnect(gNullSensorConfig);
        this.setState({ statusMessage: "SensorConnector not responding" });
    }

    hasData() {
        const { sensorSlots } = this.state;
        return sensorSlots.some((slot) => slot.sensorData && (slot.sensorData.length > 0));
    }

    sendData() {
        const { sensorSlots } = this.state,
              sendSecondSensorData = sensorSlots[1].hasData;
        const dataSpecs = sensorSlots.map((slot, i) => {
            const sensor = slot.sensorForData,
                  name = sensor && sensor.definition.measurementName,
                  position = (sensor && sensor.sensorPosition) || i+1;
            return {
                name: sendSecondSensorData ? `${name}_${position}` : name,
                unit: sensor ? sensor.valueUnit : '',
                data: slot.sensorData.slice(this.selectionRange.start, this.selectionRange.end)
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
        const { sensorSlots } = this.state;
        sensorSlots.forEach((slot) => slot.clearData());
        this.setState({
            hasData:false,
            dataReset:true,
            dataChanged:false
        });
    }

    onTimeSelect(newTime:number) {
        this.setState({
            runLength: newTime,
            xStart: 0,
            // without the .01, last tick number sometimes fails to display
            xEnd: newTime + 0.01
        });
        this.codap.updateInteractiveState({ runLength: newTime });
    }

    onGraphZoom(xStart:number, xEnd:number) {
        const sensor1Data = this.state.sensorSlots[0].sensorData;

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
            xEnd: xEnd
        });
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

        if(this.state.sensorConfig !== null) {
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
        this.props.sensorManager.requestExit();
        // pause before attempting to reload page
        const RELOAD_PAGE_DELAY_SEC = 3;
        setTimeout(() => location.reload(), RELOAD_PAGE_DELAY_SEC * 1000);
    }

    componentDidUpdate(prevProps:AppProps, prevState:AppState) {
        if(!prevState.dataReset && this.state.dataReset) {
            this.setState({
                dataReset:false
            });
        }
    }

    connectToDevice = () => {
      const { sensorManager } = this.props;
      if(isConnectableSensorManager(sensorManager)){
        sensorManager.connectToDevice();
      }
    }

    disconnectFromDevice = () => {
      const { sensorManager } = this.props;
      if(isConnectableSensorManager(sensorManager)){
        sensorManager.disconnectFromDevice();
      }
    }

    renderConnectToDeviceButton(){
      const { sensorManager } = this.props;
      // Check if this sensorManger supports device connection
      if(isConnectableSensorManager(sensorManager)) {
        if(sensorManager.deviceConnected){
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

    renderDualCollectionCheckBox(){
      if(this.props.sensorManager.supportsDualCollection) {
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
                        {this.renderConnectToDeviceButton()}
                    </div>
                    <GraphsPanel
                        sensorConfig={this.state.sensorConfig}
                        sensorSlots={this.state.sensorSlots}
                        secondGraph={this.state.secondGraph}
                        onGraphZoom={this.onGraphZoom}
                        onSensorSelect={this.handleSensorSelect}
                        onStopCollection={this.stopSensor}
                        xStart={this.state.xStart}
                        xEnd={this.state.xEnd}
                        timeUnit={this.state.timeUnit}
                        collecting={this.state.collecting}
                        hasData={this.hasData()}
                        dataReset={this.state.dataReset}
                    />
                </div>
                <ControlPanel
                    interfaceType={interfaceType}
                    collecting={this.state.collecting}
                    hasData={this.state.hasData}
                    dataChanged={this.state.dataChanged}
                    duration={this.state.runLength} durationUnit="s"
                    durationOptions={[1, 5, 10, 15, 20, 30, 45, 60]}
                    embedInCodapUrl={codapURL}
                    onDurationChange={this.onTimeSelect}
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
