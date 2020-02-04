import * as React from "react";
import * as ReactModal from "react-modal";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";
import { SensorConfiguration, gNullSensorConfig } from "../models/sensor-configuration";
import { SensorConfigColumnInfo } from "@concord-consortium/sensor-connector-interface";
import { GraphTopPanel } from "./graph-top-panel";
import { IStringMap, SensorStrings, SensorDefinitions } from "../models/sensor-definitions";
import { SensorManager, NewSensorData, ConnectableSensorManager } from "../models/sensor-manager";
import SmartFocusHighlight from "../utils/smart-focus-highlight";
import { find, pull, sumBy, cloneDeep } from "lodash";
import Button from "./smart-highlight-button";
import { SensorConnectorManager } from "../models/sensor-connector-manager";
import { SensorTagManager } from "../models/sensor-tag-manager";
import { SensorGDXManager } from "../models/sensor-gdx-manager";

export interface AppProps {
    sensorManager?: SensorManager;
}

export interface AppState {
    sensorManager:SensorManager | null,
    sensorConfig:SensorConfiguration | null;
    sensorSlots:SensorSlot[];
    hasData:boolean;
    dataChanged:boolean;
    collecting:boolean;
    runLength:number;
    timeUnit:string;
    notRespondingModal:boolean;
    suppressNotRespondingModal:boolean;
    reconnectModal:boolean;
    statusMessage:string|undefined;
    secondGraph:boolean;
    bluetoothErrorModal:boolean;
    disconnectionWarningModal:boolean;
    hasConnected:boolean;
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

export class App extends React.Component<AppProps, AppState> {

    private assetsPath:string;
    private messages:IStringMap;
    private disableWarning:boolean = false;
    private isReloading:boolean = false;
    private columnInfoCache: { [columnID: string]: SensorConfigColumnInfo[]; } = {};

    constructor(props: AppProps) {
        super(props);

        this.assetsPath = /\/examples\//.test(window.location.pathname)
                            ? "../assets" : "./assets";
        this.messages = SensorStrings.messages as IStringMap;

        this.state = {
            sensorManager:null,
            sensorConfig:null,
            sensorSlots:[new SensorSlot(0, new Sensor()), new SensorSlot(1, new Sensor())],
            hasData:false,
            dataChanged:false,
            collecting:false,
            runLength:5,
            timeUnit:"",
            notRespondingModal:false,
            suppressNotRespondingModal:false,
            reconnectModal:false,
            statusMessage:this.messages["no_device_connected"],
            secondGraph:false,
            bluetoothErrorModal:false,
            disconnectionWarningModal:false,
            hasConnected:!!this.props.sensorManager
        };

        this.onSensorConnect = this.onSensorConnect.bind(this);
        this.onSensorDisconnect = this.onSensorDisconnect.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        this.onSensorStatus = this.onSensorStatus.bind(this);
        this.onSensorCollectionStopped = this.onSensorCollectionStopped.bind(this);

        // support previous versions where we passed a sensor manager into the props
        if (this.state.sensorManager) {
            this.addSensorManagerListeners();
            this.state.sensorManager.startPolling();
        }

        this.startSensor = this.startSensor.bind(this);
        this.stopSensor = this.stopSensor.bind(this);
        this.tryReconnectModal = this.tryReconnectModal.bind(this);
        this.toggleWarning = this.toggleWarning.bind(this);
        this.addGraph = this.addGraph.bind(this);
        this.removeGraph = this.removeGraph.bind(this);
        this.reload = this.reload.bind(this);
        this.closeBluetoothErrorModal = this.closeBluetoothErrorModal.bind(this);
        this.closeDisconnectionWarningModal = this.closeDisconnectionWarningModal.bind(this);
    }

    componentDidMount() {
        SmartFocusHighlight.enableFocusHighlightOnKeyDown();
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

        // I think this will only happen with the Sensor connector when no
        // interface is attached to the computer
        if (!sensorConfig.hasInterface) {
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

    // only used when a sensor is disconnected through an action external to the
    // sensor-interactive interface (e.g., device is turned off, device runs out
    // of battery power, device malfunctions)
    onSensorDisconnect(showWarning = true) {
        this.removeSensorManagerListeners();
        this.setState({
            sensorManager: null,
            sensorConfig: null,
            statusMessage: this.messages["no_device_connected"],
            secondGraph: false,
            disconnectionWarningModal: showWarning
        });
   }

    // For a fixed set of values this sensor select should go away
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

    addSensorManagerListeners = () => {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.addListener("onSensorConnect", this.onSensorConnect);
            sensorManager.addListener("onSensorDisconnect", this.onSensorDisconnect);
            sensorManager.addListener("onSensorData", this.onSensorData);
            sensorManager.addListener("onSensorStatus", this.onSensorStatus);
            sensorManager.addListener("onCommunicationError", this.onCommunicationError);
        }
    }

    removeSensorManagerListeners = () => {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.removeListener("onSensorConnect", this.onSensorConnect);
            sensorManager.removeListener("onSensorDisconnect", this.onSensorDisconnect);
            sensorManager.removeListener("onSensorData", this.onSensorData);
            sensorManager.removeListener("onSensorStatus", this.onSensorStatus);
            sensorManager.removeListener("onCommunicationError", this.onCommunicationError);
        }
    }

    handleWiredClick = () => {
        const { sensorManager } = this.state;
        if (sensorManager instanceof SensorConnectorManager) {
            this.disconnectSensorConnector();
        } else {
            const sensorManager = new SensorConnectorManager();
            this.setState({ sensorManager, hasConnected:true }, () => {
                    this.addSensorManagerListeners();
                    if (this.state.sensorManager) {
                        this.state.sensorManager.startPolling();
                    }
                }
            );
        }
    }

    disconnectSensorConnector = () => {
        const { sensorManager } = this.state;
        if (sensorManager instanceof SensorConnectorManager) {
            sensorManager.removeListeners();
            this.removeSensorManagerListeners();
            this.setState({
                sensorManager: null,
                sensorConfig: null,
                secondGraph: false,
                statusMessage: this.messages["no_device_connected"]
            });
        }
    }

    handleWirelessClick = () => {
        const { sensorManager } = this.state;
        if (sensorManager && sensorManager.isWirelessDevice()) {
            this.disconnectWirelessDevice();
        } else {
            this.connectWirelessDevice();
        }
    }

    disconnectWirelessDevice = () => {
        this.disconnectFromDevice();
        this.removeSensorManagerListeners();
        this.setState({
            sensorManager: null,
            sensorConfig: null,
            secondGraph: false,
            statusMessage: this.messages["no_device_connected"]
        });
    }

    async connectWirelessDevice() {
        try {
            let optionalServices: any[] = [];
            let wirelessFilters: any[] = [];
            [SensorTagManager, SensorGDXManager].forEach(mgrClass => {
              optionalServices.push(...mgrClass.getOptionalServices());
              wirelessFilters.push(...mgrClass.getWirelessFilters());
            });

            wirelessFilters = wirelessFilters.concat(SensorGDXManager.getWirelessFilters());
            // Step 1: ask for a device
            const wirelessDevice: any = await navigator.bluetooth.requestDevice({
                filters: wirelessFilters,
                optionalServices: optionalServices
            });

            if (!wirelessDevice) {
                console.log("Failed to create wirelessDevice");
                this.setState({ bluetoothErrorModal: true });
                return;
            }

            this.setState({ statusMessage: this.messages["connecting"] });

            const isGDX = wirelessDevice.name.includes("GDX");
            let sensorManager;
            if (isGDX) {
                sensorManager = new SensorGDXManager();
            } else {
                sensorManager = new SensorTagManager();
            }
            if (!sensorManager) {
                console.log("Failed to create sensorManager");
                this.setState({ bluetoothErrorModal: true });
                return;
            }

            this.removeSensorManagerListeners();

            this.setState({ sensorManager, hasConnected:true }, () => {
                if (isConnectableSensorManager(this.state.sensorManager)) {
                    this.state.sensorManager.connectToDevice(wirelessDevice).then(val => {
                        if (!val) {
                            console.log("Failed to connect to wirelessDevice");
                            this.setState({ bluetoothErrorModal: true });
                        } else {
                            this.addSensorManagerListeners();
                            if (this.state.sensorManager) {
                                this.state.sensorManager.startPolling();
                            }
                        }
                    });
                }
            });
        } catch (err) {
            console.log("No wireless device selected");
        }
    }

    startConnecting = () => {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.requestWake();
        }
    }

    // These are used by the ControlPanel to start and stop a continuous
    // collection, it isn't needed by a simple numeric display, but for battery
    // life it might make sense to support this even in a simple numeric display
    // there could be the concept of sleeping or slowing the display when not
    // in use.
    startSensor() {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.requestStart();
        }
        this.setState({ statusMessage: this.messages["starting_data_collection"] });
    }

    stopSensor() {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.requestStop();
        }
    }

    onSensorCollectionStopped() {
        this.setState({
            collecting: false,
            statusMessage: this.messages["data_collection_stopped"]
        });
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager!.removeListener('onSensorCollectionStopped',
            this.onSensorCollectionStopped);
        }
    }

    // This should only be called while we are collecting
    // For our simple single value display this is not necessary but it
    // should be something supported by the common sensor library. I don't think
    // the library should store the state of the sensor data itself though.
    onSensorData(newSensorData: NewSensorData) {
        if (!this.state.collecting) {
            this.setState({
                hasData: true,
                dataChanged: true,
                collecting: true,
                statusMessage: this.messages["collecting_data"]
            });
            const { sensorManager } = this.state;
            if (sensorManager) {
                sensorManager.addListener('onSensorCollectionStopped', this.onSensorCollectionStopped);
            }
        }
        const { sensorSlots } = this.state;

        // Keep track of the smallest last time value. We want to keep collecting
        // until all of the sensors have reached the runLength.
        let lastTime = Number.MAX_SAFE_INTEGER,
            newSensorDataArrived = false;
        let overTime = false;

        sensorSlots.forEach((sensorSlot) => {
          const sensor = sensorSlot.sensor,
              sensorData = sensor && sensor.columnID && newSensorData[sensor.columnID];
          if (!sensor || !sensor.columnID) {
            // This sensorSlot is empty (I hope)
            return;
          }

          if (!sensorData) {
            // The sensorSlot is not empty. Just newData doesn't contain any data
            // for this sensor
            lastTime = Math.min(lastTime, sensorSlot.timeOfLastData);
            return;
          }
          sensorSlot.appendData(sensorData, this.state.runLength);
          newSensorDataArrived = true;
          lastTime = Math.min(lastTime, sensorSlot.timeOfLastData);
          overTime = (sensorData[0][0] > this.state.runLength);
        });

        if (newSensorDataArrived) {
          this.setState({
              hasData: true,
              dataChanged: true,
              sensorSlots: this.state.sensorSlots });
        }

        if (lastTime !== Number.MAX_SAFE_INTEGER && (lastTime >= this.state.runLength || overTime)) {
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
            // make a deep copy to ensure that we don't have the
            // same date object in each cache index
            const dataColumnClone = cloneDeep(dataColumn);
            cache.push(dataColumnClone);
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
          if (liveValue == null) {
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

    dismissNotRespondingModal = () => {
        this.setState({ notRespondingModal: false });
    }

    launchSensorConnector = () => {
        this.setState({ statusMessage: "Launching SensorConnector...", notRespondingModal: false });
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.requestSleep();
            // pause before attempting to reload SensorConnector
            setTimeout(() => {
                if (this.state.sensorManager) {
                    this.state.sensorManager.requestWake();
                }
            }, SLEEP_WAKE_DELAY_SEC * 1000);
        }
    }

    closeBluetoothErrorModal() {
        this.setState({ bluetoothErrorModal: false });
        this.onSensorDisconnect(false);
    }

    closeDisconnectionWarningModal() {
        this.setState({ disconnectionWarningModal: false });
    }

    tryReconnectModal() {
        this.setState({ reconnectModal: false });

        if (this.state.sensorConfig != null) {
            this.onSensorConnect(this.state.sensorConfig);
        }
    }

    toggleWarning() {
        this.disableWarning = true;
    }

    addGraph() {
        const secondGraph = true;
        this.setState({ secondGraph });
    }

    removeGraph = (slotNum: number) => () => {
        let { secondGraph, sensorManager, sensorSlots } = this.state;
        if (secondGraph) {
            // remove a graph
            // could be the first or second one
            // if user removes first graph, then move sensor in second graph to first graph
            secondGraph = false;
            if (slotNum === 0) {
                sensorSlots[0].sensor = sensorSlots[1].sensor;
            }
            this.setState({
                sensorSlots: sensorSlots,
                secondGraph: secondGraph
            });
        } else {
            // if only one graph shown, then disconnect from device entirely
            if (sensorManager && sensorManager.isWirelessDevice()) {
                this.disconnectWirelessDevice();
            } else if (sensorManager instanceof SensorConnectorManager) {
                this.disconnectSensorConnector();
            }
        }
    }

    // This was found to be useful for dealing with sensor connector flakiness
    // it was connected to a reload icon in the ControlPanel
    reload() {
        this.isReloading = true;
        this.setState({ statusMessage: "Reloading SensorConnector..."});
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.requestSleep();
        }
        // pause before attempting to reload page
        setTimeout(() => location.reload(), SLEEP_WAKE_DELAY_SEC * 1000);
    }

    connectToDevice = () => {
      const { sensorManager } = this.state;
      if (isConnectableSensorManager(sensorManager)) {
        sensorManager.connectToDevice();
      }
    }

    disconnectFromDevice = () => {
      const { sensorManager } = this.state;
      if (isConnectableSensorManager(sensorManager)) {
        sensorManager.disconnectFromDevice();
      }
    }

    zeroSensor = (slotNum: number) => () => {
        let { sensorSlots } = this.state;
        if (sensorSlots[slotNum].sensor) {
            sensorSlots[slotNum].sensor.zeroSensor();
            this.setState({ sensorSlots });
        }
    }

    renderStatusMessage() {
        const { sensorManager, sensorConfig } = this.state;
        let wirelessIconClass = "wireless-status-icon ";
        if (sensorManager != null) {
            if (sensorManager.isWirelessDevice()) {
                if (sensorConfig && sensorConfig.hasInterface) {
                    wirelessIconClass = wirelessIconClass + "connected";
                } else {
                    wirelessIconClass = wirelessIconClass + "connecting";
                }
            } else {
                if (sensorConfig && sensorConfig.hasInterface && this.connectedSensorCount() > 0) {
                    wirelessIconClass = wirelessIconClass + "connected";
                }
            }
        }
        return (
            <div className="top-bar-left-controls">
                <div className="status-message-holder">
                    <div className="wireless-status-border">
                        <div className={wirelessIconClass}>
                        <div className="wireless-status-icon-hi"/>
                        </div>
                    </div>
                    <div className="status-message">{this.state.statusMessage || "\xA0"}</div>
                </div>
            </div>
        );
    }

    renderSensorControls() {
        const { sensorManager } = this.state;
        const wirelessConnected = sensorManager && sensorManager.isWirelessDevice();
        const wiredConnected = sensorManager && !sensorManager.isWirelessDevice();
        return (
            <div className="sensor-controls-holder">
                {!wiredConnected && !wirelessConnected ?
                    <div className="connect-message-holder">
                        <div className="connect-message">{this.messages["connection_message"]}</div>
                        <div className="connect-sub-message">{this.messages["connection_sub_message"]}</div>
                    </div>
                    : null
                }
                <div className="sensor-buttons">
                    {this.renderConnectionButtons()}
                </div>
                {this.renderGraphTopPanels()}
            </div>
        );
    }

    renderConnectionButtons() {
        const { sensorManager } = this.state;
        const wirelessConnected = sensorManager && sensorManager.isWirelessDevice();
        const wiredConnected = sensorManager && !sensorManager.isWirelessDevice();
        if (!this.props.sensorManager) {
            return (
                <div>
                    { !wiredConnected && !wirelessConnected ?
                    <div>
                        <button className="connect-to-device-button smart-focus-highlight disable-focus-highlight"
                                onClick={this.handleWirelessClick}
                                disabled={wiredConnected || this.state.collecting}>
                            Wireless Sensor
                        </button>
                        <button className="connect-to-device-button smart-focus-highlight disable-focus-highlight"
                                onClick={this.handleWiredClick}
                                disabled={wirelessConnected || this.state.collecting}>
                            Wired Sensor
                        </button>
                    </div>
                    : null }
                </div>
            );
        } else {
            // Check if this sensorManger supports device connection
            if (isConnectableSensorManager(sensorManager)) {
                if (sensorManager.deviceConnected) {
                return  <Button className="connect-to-device-button" onClick={this.disconnectFromDevice} >
                            Disconnect Device
                        </Button>;
                } else {
                return  <Button className="connect-to-device-button" onClick={this.connectToDevice} >
                            Connect Device
                        </Button>;
                }
            } else {
                return null;
            }
        }
    }

    renderGraphTopPanels() {
        const { sensorManager, sensorSlots } = this.state;
        const connected = sensorManager != null;
        const sensorColumns = (this.state.sensorConfig && this.state.sensorConfig.dataColumns) || [];
        return (
            <div className="graph-top-panel-holder">
                {connected ?
                    <GraphTopPanel
                    sensorSlot={sensorSlots && sensorSlots[0]}
                    sensorColumns={sensorColumns}
                    sensorPrecision={sensorSlots[0].sensor ? sensorSlots[0].sensor.sensorPrecision() : 2}
                    onSensorSelect={this.handleSensorSelect}
                    onZeroSensor={this.zeroSensor(0)}
                    onRemoveSensor={this.removeGraph(0)}
                    showRemoveSensor={!this.props.sensorManager}
                    assetsPath={this.assetsPath} />
                : null}
                {connected && this.state.secondGraph ?
                    <GraphTopPanel
                    sensorSlot={sensorSlots && sensorSlots[1]}
                    sensorColumns={sensorColumns}
                    sensorPrecision={sensorSlots[1].sensor ? sensorSlots[1].sensor.sensorPrecision() : 2}
                    onSensorSelect={this.handleSensorSelect}
                    onZeroSensor={this.zeroSensor(1)}
                    onRemoveSensor={this.removeGraph(1)}
                    showRemoveSensor={true}
                    assetsPath={this.assetsPath} />
                : null}
            </div>
        );
    }

    renderAddSensorButton() {
        const { sensorManager } = this.state;
        return (
            <div className="top-bar-right-controls">
                {sensorManager && sensorManager.supportsDualCollection &&
                 !this.state.secondGraph &&
                 this.connectedSensorCount() > 1 ?
                 <Button className="add-sensor-button" onClick={this.addGraph}>+ Add A Sensor</Button>
                 : null
                }
            </div>
        );
    }

    render() {
        var { sensorConfig, sensorManager } = this.state,

        return (
            <div className="app-container">
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="SensorConnector not responding"
                            isOpen={this.state.notRespondingModal} >
                    <div className="sensor-dialog-header">Warning</div>
                    <p>{this.messages["sensor_connector_not_responding"]}</p>
                    <div className="sensor-dialog-buttons">
                        <button onClick={this.launchSensorConnector}>Launch SensorConnector</button>
                        <button onClick={this.dismissNotRespondingModal}>Dismiss</button>
                    </div>
                </ReactModal>
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="Sensor not attached"
                            isOpen={this.state.reconnectModal} >
                    <div className="sensor-dialog-header">Warning</div>
                    <p>{this.messages["sensor_not_attached"]}</p>
                    <div className="sensor-dialog-buttons">
                        <button onClick={this.tryReconnectModal}>Try again</button>
                    </div>
                </ReactModal>
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="Bluetooth connection failed"
                            isOpen={this.state.bluetoothErrorModal} >
                    <div className="sensor-dialog-header">Error</div>
                    <p>{this.messages["bluetooth_connection_failed"]}</p>
                    <div className="sensor-dialog-buttons">
                        <button onClick={this.closeBluetoothErrorModal}>Ok</button>
                    </div>
                </ReactModal>
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="Sensor disconnection warning"
                            isOpen={this.state.disconnectionWarningModal} >
                    <div className="sensor-dialog-header">Warning</div>
                    <p>{this.messages["sensor_disconnection_warning"]}</p>
                    <div className="sensor-dialog-buttons">
                        <button onClick={this.closeDisconnectionWarningModal}>Ok</button>
                    </div>
                </ReactModal>
                <div className="app-content">
                    <div className="app-top-bar">
                        {this.renderStatusMessage()}
                        {this.renderSensorControls()}
                        {this.renderAddSensorButton()}
                    </div>
                </div>
            </div>
        );
    }
}
