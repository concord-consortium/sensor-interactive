import * as React from "react";
import * as ReactModal from "react-modal";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";
import { SensorConfiguration, gNullSensorConfig } from "../models/sensor-configuration";
import { SensorConfigColumnInfo } from "@concord-consortium/sensor-connector-interface";
import GraphsPanel from "./graphs-panel";
import { GraphTopPanel } from "./graph-top-panel";
import { ControlPanel } from "./control-panel";
import { Codap, IDataSpec } from "../models/codap";
import { IStringMap, SensorStrings, SensorDefinitions } from "../models/sensor-definitions";
import { SensorManager, NewSensorData, ConnectableSensorManager } from "../models/sensor-manager";
import SmartFocusHighlight from "../utils/smart-focus-highlight";
import { find, pull, sumBy, cloneDeep } from "lodash";
import Button from "./smart-highlight-button";
import { SensorConnectorManager } from "../models/sensor-connector-manager";
import { FakeSensorManager } from "../models/fake-sensor-manager";
import { SensorTagManager } from "../models/sensor-tag-manager";
import { SensorGDXManager } from "../models/sensor-gdx-manager";
import { IInteractiveState, SensorRecording } from "../interactive/types";
import { SensorRecordingStore } from "../models/recording-store";
import { PredictionState } from "./types";

import "./dialog.css";
import "./app.css";

const DEFAULT_RUN_LENGTH = 5;

/*
    SensorRecordingStore Design Notes & Future Work

    The SensorRecordingStore was the result of work to both pull the data storage out of the SensorSlot
    and to replace the fixed 2-element SensorSlot array with a dynamic array of Sensor objects so that
    the secondGraph app state flag could be removed along with simplifing the code to know how many
    graphs had data.  This work was done to decouple sensors and graphs so that saved and prediction
    graphs could be displayed without sensors being connected.

    The 2-element SensorSlot array is still in place as time ran out to refactor that code.  In the future
    this app could be further simplified by replacing that structure with a 0, 1 or 2 element array of
    sensors, with the current SensorSlot slotIndex variable pulled into the sensor class.
*/
const sensorRecordingStore = new SensorRecordingStore();

export type InteractiveHost = "codap" | "runtime" | "report";

export interface AppProps {
    sensorManager?: SensorManager;
    fakeSensor?: boolean;
    singleReads?: boolean;
    interactiveHost?: InteractiveHost;
    maxGraphHeight?: number;
    initialInteractiveState?: IInteractiveState | null;
    preRecordings?: SensorRecording[];
    prompt?: string;
    enablePause?: boolean;
    requirePrediction?: boolean;
    setInteractiveState?: (stateOrUpdateFunc: IInteractiveState | ((prevState: IInteractiveState | null) => IInteractiveState) | null) => void
}

export interface AppState {
    sensorManager:SensorManager | null,
    sensorConfig:SensorConfiguration | null;
    sensorSlots:SensorSlot[];
    hasData:boolean;
    dataChanged:boolean;
    dataReset:boolean;
    predictionState: PredictionState;
    prediction: number[][];
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
    bluetoothErrorModal:boolean;
    disconnectionWarningModal:boolean;
    aboutModal:boolean;
    sensorRecordings: SensorRecording[];
    pauseHeartbeat: boolean;
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
    let matched:(Sensor|null)[] = [null, null],
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
    private codap:Codap | undefined;
    private selectionRange:{start:number,end:number|undefined} = {start:0,end:undefined};
    private disableWarning:boolean = false;
    private isReloading:boolean = false;
    private columnInfoCache: { [columnID: string]: SensorConfigColumnInfo[]; } = {};
    private interactiveHost: InteractiveHost;

    constructor(props: AppProps) {
        super(props);

        this.interactiveHost = this.props.interactiveHost || "codap";

        this.assetsPath = /\/examples|interactive\//.test(window.location.pathname)
                            ? "../assets" : "./assets";
        this.messages = SensorStrings.messages as IStringMap;

        this.state = {
            sensorManager:this.passedSensorManager(),
            sensorConfig:null,
            sensorSlots:[new SensorSlot(0, new Sensor()), new SensorSlot(1, new Sensor())],
            hasData:false,
            dataChanged:false,
            dataReset:false,
            collecting:false,
            predictionState: props.requirePrediction ? "pending" : "not-required",
            prediction: [],
            runLength:DEFAULT_RUN_LENGTH,
            xStart:0,
            xEnd:DEFAULT_RUN_LENGTH + 0.01, // without the .01, last tick number sometimes fails to display
            timeUnit:"",
            notRespondingModal:false,
            suppressNotRespondingModal:false,
            warnNewModal:false,
            reconnectModal:false,
            statusMessage:this.messages["no_device_connected"],
            secondGraph:false,
            bluetoothErrorModal:false,
            disconnectionWarningModal:false,
            aboutModal:false,
            sensorRecordings:[],
            pauseHeartbeat: false
        };

        this.onSensorConnect = this.onSensorConnect.bind(this);
        this.onSensorDisconnect = this.onSensorDisconnect.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        this.onSensorStatus = this.onSensorStatus.bind(this);
        this.onSensorCollectionStopped = this.onSensorCollectionStopped.bind(this);
        this.onSensorHeartbeat = this.onSensorHeartbeat.bind(this);

        if (this.interactiveHost === "codap") {
            this.connectCodap = this.connectCodap.bind(this);
            setTimeout(this.connectCodap, 1000);
        }

        // support previous versions where we passed a sensor manager into the props
        if (this.state.sensorManager) {
            this.addSensorManagerListeners();
            this.state.sensorManager.startPolling();
        }

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
        this.addGraph = this.addGraph.bind(this);
        this.removeGraph = this.removeGraph.bind(this);
        this.reload = this.reload.bind(this);
        this.closeBluetoothErrorModal = this.closeBluetoothErrorModal.bind(this);
        this.closeDisconnectionWarningModal = this.closeDisconnectionWarningModal.bind(this);
        this.closeAboutModal = this.closeAboutModal.bind(this);
        this.showAbout= this.showAbout.bind(this);
        this.saveInteractiveState = this.saveInteractiveState.bind(this);
        this.togglePauseHeartbeat = this.togglePauseHeartbeat.bind(this);
        this.startPrediction = this.startPrediction.bind(this);
        sensorRecordingStore.listenForNewData((sensorRecordings) => this.setState({sensorRecordings}));
    }

    togglePauseHeartbeat() {
        const nextPause = !this.state.pauseHeartbeat;
        this.setState({pauseHeartbeat: nextPause},
            () => {
                if (this.state.sensorManager) {
                    this.state.sensorManager.requestHeartbeat(!nextPause);
                }
            }
        );
    }

    startPrediction() {
        console.log("start prediction");
        this.setState({predictionState:"started"});
    }

    passedSensorManager = () => {
        return (typeof this.props.sensorManager !== "undefined" ? this.props.sensorManager : null);
    }

    addPrediction = (p: number[]) => {
        const { prediction } = this.state;
        const sortFunc = (a: number[], b: number[]) => a[0] - b[0];
        const nextPrediction = [...prediction, p].sort(sortFunc);
        this.setState({prediction: nextPrediction});
    }

    componentDidMount() {
        SmartFocusHighlight.enableFocusHighlightOnKeyDown();

        const {initialInteractiveState} = this.props;
        
        if (initialInteractiveState) {
            if (initialInteractiveState.version === 1) {
                let predictionState = this.state.predictionState;
                const {sensorRecordings, prediction} = initialInteractiveState;
                const runLength = this.props.singleReads ? DEFAULT_RUN_LENGTH : (initialInteractiveState.runLength || DEFAULT_RUN_LENGTH);
                sensorRecordingStore.setRecordings(sensorRecordings);
                if (prediction && prediction.length > 0) {
                    predictionState = "completed"
                }
                this.setState({
                    runLength,
                    xEnd: runLength + 0.01,
                    hasData: true,
                    prediction,
                    predictionState
                });
            } else {
                console.error(`Unknown interactive state version: ${initialInteractiveState.version}`, {initialInteractiveState});
            }
        }
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

    HACK_numSensors() {
        let numSensors = 0;
        if (this.state.sensorConfig) {
            numSensors++;
            if (this.state.secondGraph) {
                numSensors++;
            }
        }
        return numSensors;
    }

    onSensorConnect(sensorConfig:SensorConfiguration, callback?: () => void) {
        const interfaceType = sensorConfig.interface;
        let sensorSlots = this.state.sensorSlots;

        if (this.isReloading) { return; }

        const afterSetState = () => {
            sensorRecordingStore.configure(sensorSlots, this.HACK_numSensors());
            callback?.();
        };

        if (!sensorConfig.hasInterface) {
            sensorSlots = matchSensorsToDataColumns(sensorSlots, null);
            this.setState({
                sensorConfig: null,
                sensorSlots,
                statusMessage: this.messages["no_sensors"]
            }, afterSetState);
        }
        else {
            this.setStatusInterfaceConnected(interfaceType || "");

            const timeUnit = sensorConfig.timeUnit || "",
                  dataColumns = sensorConfig.dataColumns;

            sensorSlots = matchSensorsToDataColumns(sensorSlots, dataColumns || null);

            this.setState({ sensorConfig, sensorSlots, timeUnit }, afterSetState);
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

        sensorRecordingStore.configure(sensorSlots, this.HACK_numSensors());
        this.saveInteractiveState();
    }

    addSensorManagerListeners = () => {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.addListener("onSensorConnect", this.onSensorConnect);
            sensorManager.addListener("onSensorDisconnect", this.onSensorDisconnect);
            sensorManager.addListener("onSensorData", this.onSensorData);
            sensorManager.addListener("onSensorStatus", this.onSensorStatus);
            sensorManager.addListener("onCommunicationError", this.onCommunicationError);
            sensorManager.addListener("onSensorHeartbeat", this.onSensorHeartbeat);

            sensorManager.requestHeartbeat(true);
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
            sensorManager.removeListener("onSensorHeartbeat", this.onSensorHeartbeat);

            sensorManager.requestHeartbeat(false);
        }
    }

    handleWiredClick = () => {
        const { sensorManager } = this.state;
        if (sensorManager instanceof SensorConnectorManager) {
            this.disconnectSensorConnector();
        } else {
            if (this.props.fakeSensor) {
                const sensorManager = new FakeSensorManager({singleReads: this.props.singleReads});
                this.setState({ sensorManager }, () => {
                        this.addSensorManagerListeners();
                        if (this.state.sensorManager) {
                            this.state.sensorManager.startPolling();
                        }
                    }
                );
            } else {
                const sensorManager = new SensorConnectorManager();
                this.setState({ sensorManager }, () => {
                        this.addSensorManagerListeners();
                        if (this.state.sensorManager) {
                            this.state.sensorManager.startPolling();
                        }
                    }
                );
            }
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
            this.disconnectDevice();
        } else {
            if (this.props.fakeSensor) {
                const sensorManager = new FakeSensorManager({singleReads: this.props.singleReads});
                this.setState({ sensorManager, secondGraph: false }, () => {
                        this.addSensorManagerListeners();
                        if (this.state.sensorManager) {
                            this.state.sensorManager.startPolling();
                        }
                    }
                );
            } else {
                this.connectWirelessDevice();
            }
        }
    }

    disconnectDevice = () => {
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

            this.setState({ sensorManager }, () => {
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
            console.error(err);
            console.error("No wireless device selected");
        }
    }

    startConnecting = () => {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.requestWake();
        }
    }

    startSensor() {
        const { sensorManager } = this.state;
        if (sensorManager) {
            if (this.props.singleReads) {
                sensorRecordingStore.requestNewDataPoint();
            } else {
                sensorRecordingStore.startNewRecordings();
            }
            // before we start recording data, turn off the heartbeat handler.
            sensorManager.requestHeartbeat(false);
            sensorManager.requestStart();
            this.setState({
                statusMessage: this.messages["starting_data_collection"],pauseHeartbeat: true
            });
        }
    }

    stopSensor() {
        const { sensorManager } = this.state;
        if (sensorManager) {
            sensorManager.requestStop();
        }
    }

    onSensorCollectionStopped() {
        const saveCallback = () => {
            const { sensorManager } = this.state;
            if (sensorManager) {
                sensorManager.removeListener(
                    'onSensorCollectionStopped',
                    this.onSensorCollectionStopped
                );
                sensorManager.requestHeartbeat(true);
            }
        };

        this.setState(
            {
                collecting: false,
                pauseHeartbeat: false, // resume heartbeat after collection is stopped
                statusMessage: this.messages["data_collection_stopped"]
            },
            () =>  this.saveInteractiveState(saveCallback)
        );
    }

    // This should only be called while we are collecting
    onSensorData(newSensorData: NewSensorData) {
        const { sensorSlots } = this.state;

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

        if (this.props.singleReads) {
            let haveAllData = true;
            let xEnd = 0;
            sensorSlots.forEach((sensorSlot) => {
                const sensor = sensorSlot.sensor,
                    sensorData = sensor && sensor.columnID && newSensorData[sensor.columnID];
                if (sensorData) {
                    haveAllData = haveAllData && sensorRecordingStore.recordOneDataPointIfNeeded(sensorSlot, sensorData);
                }
                xEnd = Math.ceil(Math.max(xEnd, sensorRecordingStore.timeOfLastData(sensorSlot)));
            });
            if (haveAllData) {
                this.stopSensor();
            }
            this.saveInteractiveState();
            // allow for some padding on the right side
            xEnd = Math.max(DEFAULT_RUN_LENGTH, xEnd + 1) + 0.01;
            this.setState({xEnd, sensorSlots, hasData: true});
            return;
        }

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
            lastTime = Math.min(lastTime, sensorRecordingStore.timeOfLastData(sensorSlot));
            return;
          }
          sensorRecordingStore.appendData(sensorSlot, sensorData, this.state.runLength);
          newSensorDataArrived = true;
          lastTime = Math.min(lastTime, sensorRecordingStore.timeOfLastData(sensorSlot));
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

    onSensorHeartbeat(sensorConfig:SensorConfiguration) {
        const { sensorSlots } = this.state;

        sensorSlots.forEach((sensorSlot) => {
          const { sensor } = sensorSlot,
              columnID = sensor.columnID,
              dataColumn = columnID && sensorConfig.getColumnByID(columnID),
              liveValue = dataColumn ? Number(dataColumn.liveValue) : undefined;

          sensor.sensorHeartbeatValue = liveValue;
        });

        this.setState({ sensorSlots });
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
        return sensorSlots.some((slot) => sensorRecordingStore.hasData(slot));
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
              sendSecondSensorData = secondGraph && sensorRecordingStore.hasData(sensorSlots[1]),
              dataSpecs: IDataSpec[] = [];
        sensorSlots.forEach((slot, i) => {
            const sensorRecording = sensorRecordingStore.getSensorRecording(slot);
            if (sensorRecording) {
                const {name, unit, data, sensorPosition} = sensorRecording;
                dataSpecs.push({
                    name: sendSecondSensorData ? `${name}_${sensorPosition}` : name,
                    unit,
                    data: this.downSample(data.slice(this.selectionRange.start, this.selectionRange.end))
                })
            }
            return {
            };
        });
        if (!sendSecondSensorData) {
            this.codap?.sendData(dataSpecs[0]);
        }
        else {
            this.codap?.sendDualData(dataSpecs);
        }

        this.setState({ dataChanged: false });
    }

    saveInteractiveState(afterSave?: () => void) {
        if (this.props.setInteractiveState) {
            this.props.setInteractiveState({
                version: 1,
                sensorRecordings: this.state.sensorRecordings,
                runLength: this.props.singleReads ? DEFAULT_RUN_LENGTH : this.state.runLength,
                prediction: this.state.prediction,
            });
            this.setState({dataChanged: false}, afterSave);
        }

    }

    checkNewData() {
        if (this.state.dataChanged && !this.disableWarning) {
            this.setState({ warnNewModal: true });
        } else {
            this.newData();
        }
    }

    newData() {
        let { runLength } = this.state;
        const { sensorSlots } = this.state;
        sensorRecordingStore.startNewRecordings();
        this.setState({
            hasData:false,
            dataReset:true,
            dataChanged:false,
            sensorSlots,
            runLength
        }, () => {
            this.saveInteractiveState();
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
        this.setState({ runLength: newTime }, () => {
            this.saveInteractiveState()
        });
        this.setXZoomState(newTime);
        this.codap?.updateInteractiveState({ runLength: newTime });
    }

    onGraphZoom(xStart:number, xEnd:number) {
        const sensorRecording = sensorRecordingStore.getSensorRecording(this.state.sensorSlots[0])
        const sensor1Data = sensorRecording?.data || [];
        const { xStart: prevXStart, xEnd: prevXEnd } = this.state;

        // bail if no change
        if ((prevXStart === xStart) && (prevXEnd === xEnd)) return;

        // convert from time value to index
        var i:number, entry:number[], nextEntry:number[];
        for(i=0; i < sensor1Data.length-1; i++) {
            entry = sensor1Data[i];
            nextEntry = sensor1Data[i+1];
            if (entry[0] === xStart) {
                this.selectionRange.start = i;
                break;
            } else if (entry[0] < xStart && nextEntry[0] >= xStart) {
                this.selectionRange.start = i+1;
                break;
            }
        }
        for(i; i < sensor1Data.length-1; i++) {
            entry = sensor1Data[i];
            nextEntry = sensor1Data[i+1];
            if (entry[0] > xEnd) {
                this.selectionRange.end = i;
                break;
            } else if (i === sensor1Data.length-1) {
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

    closeWarnNewModal() {
        this.setState({ warnNewModal: false });
    }

    closeBluetoothErrorModal() {
        this.setState({ bluetoothErrorModal: false });
        this.onSensorDisconnect(false);
    }

    closeDisconnectionWarningModal() {
        this.setState({ disconnectionWarningModal: false });
    }

    closeAboutModal() {
        this.setState({ aboutModal: false })
    }

    discardData() {
        this.closeWarnNewModal();
        this.newData();
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
        this.setState({ secondGraph }, () => {
            sensorRecordingStore.configure(this.state.sensorSlots, this.HACK_numSensors());
            this.saveInteractiveState()
        });
        this.codap?.updateInteractiveState({ secondGraph });

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
            }, () => {
                sensorRecordingStore.configure(sensorSlots, this.HACK_numSensors());
                this.saveInteractiveState()
            });
            this.codap?.updateInteractiveState({ secondGraph });
        } else {
            // if only one graph shown, then disconnect from device entirely
            if (sensorManager && (sensorManager.isWirelessDevice() || sensorManager instanceof FakeSensorManager)) {
                this.disconnectDevice();
            } else if (sensorManager instanceof SensorConnectorManager) {
                this.disconnectSensorConnector();
            }
        }
    }

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

    showAbout() {
        this.setState({ aboutModal: true })
    }

    componentDidUpdate(prevProps:AppProps, prevState:AppState) {
        if (!prevState.dataReset && this.state.dataReset) {
            this.setState({ dataReset:false });
        }
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
        const sensorSlot = sensorSlots[slotNum]
        if (sensorSlot?.sensor) {
            sensorSlot.sensor.zeroSensor();
            sensorRecordingStore.zeroSensor(sensorSlot);
            this.setState({ sensorSlots });
            this.saveInteractiveState();
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
        const { sensorManager, sensorSlots, pauseHeartbeat } = this.state;
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
                    assetsPath={this.assetsPath}
                    readingPaused={pauseHeartbeat}
                    />
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
                    assetsPath={this.assetsPath}
                    readingPaused={pauseHeartbeat}
                    />
                : null}
            </div>
        );
    }

    renderTopRightButtons() {
        const { sensorManager, pauseHeartbeat, predictionState } = this.state;
        const pauseLabel = `${pauseHeartbeat ? "Start" : "Pause"} Reading`
        const pauseDisabled = this.state.collecting;
        const pauseClassName = `pause-heartbeat-button ${pauseDisabled ? "disabled" : ""}`;
        const { enablePause } = this.props;
        const isConnected = this.connectedSensorCount() > 0;

        const showPredictionButton = isConnected && predictionState !== 'not-required';
        const diasablePredictionButton =
            predictionState === "started" || predictionState === "completed";

        const showPauseButton = sensorManager
            && sensorManager.supportsHeartbeat
            && isConnected
            && enablePause;

        return (
            <div className="top-bar-right-controls">
                {sensorManager && sensorManager.supportsDualCollection &&
                    !this.state.secondGraph &&
                    this.connectedSensorCount() > 1 ?
                    <Button
                        className="add-sensor-button"
                        onClick={this.addGraph}>
                        + Add A Sensor
                    </Button>
                 : null
                }
                {showPauseButton &&
                 <Button
                    className={pauseClassName}
                    onClick={this.togglePauseHeartbeat}
                    disabled={pauseDisabled}>{pauseLabel}</Button>
                }
                {showPredictionButton &&
                    <Button
                        className="prediction-button"
                        onClick={this.startPrediction}
                        disabled={diasablePredictionButton}>
                        Predict
                    </Button>
                }
            </div>
        );
    }

    renderLegendItem(className:string, label:string) {
        return (
            <>
                <div className={`bar ${className}`} />
                <div className={`name ${className}`}>
                    {label}
                </div>
            </>
        );
    }

    renderPrimaryLegend() {
        const label = this.state.sensorSlots[0].sensor.definition.measurementName;
        return this.renderLegendItem("primary", label)
    }

    renderSecondaryLegend() {
        const label = this.state.sensorSlots[1].sensor.definition.measurementName;
        if (this.state.secondGraph) {
            return this.renderLegendItem("secondary", label)
        }
        return null;
    }

    renderPredictionLegend() {
        const {predictionState} = this.state;
        if (predictionState !== 'not-required') {
            return this.renderLegendItem("prediction", "Prediction");
        }
        return null;
    }


    renderLegend() {
        if (this.connectedSensorCount() > 0) {
            return(
                <div className="bottom-legend">
                    { this.renderPrimaryLegend() }
                    { this.renderSecondaryLegend() }
                    { this.renderPredictionLegend() }
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        var { sensorConfig, sensorManager, sensorRecordings } = this.state,
            codapURL = window.self === window.top
                        ? "http://codap.concord.org/releases/latest?di=" + window.location.href
                        : "",
            interfaceType = (sensorConfig && sensorConfig.interface) || "";
        const isConnectorAwake = sensorManager ? sensorManager.isAwake() : true;
        const showControls = this.props.interactiveHost !== "report";
        const singleReads = !!this.props.singleReads;
        const preRecordings = this.props.preRecordings ? [...this.props.preRecordings]: [];

        const savePrediction = () => {
            this.setState({predictionState: "completed"});
        }
        const clearPrediction = () => {
            this.setState({
                prediction: [],
            });
        }
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
                            contentLabel="Discard data?"
                            isOpen={this.state.warnNewModal} >
                    <div className="sensor-dialog-header">Warning</div>
                    <p>{this.messages["check_save"]}</p>
                    <label>
                        <input type="checkbox" onChange={this.toggleWarning}/>
                        Don't show this message again
                    </label>
                    <div className="sensor-dialog-buttons">
                        <button onClick={this.closeWarnNewModal}>Preserve Data</button>
                        <button onClick={this.discardData}>Discard Data</button>
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
                <ReactModal className="sensor-dialog-content"
                            overlayClassName="sensor-dialog-overlay"
                            contentLabel="About: Sensor Interactive"
                            isOpen={this.state.aboutModal} >
                    <div className="sensor-dialog-header">About</div>
                    <p>{this.messages["about_message"]}</p>
                    <div className="sensor-dialog-buttons">
                        <button onClick={this.closeAboutModal}>Ok</button>
                    </div>
                </ReactModal>
                { this.props.prompt && <div className="prompt" dangerouslySetInnerHTML={{ __html: this.props.prompt}} /> }
                <div className="app-content">
                    {showControls && <div className="app-top-bar">
                        {this.renderStatusMessage()}
                        {this.renderSensorControls()}
                        {this.renderTopRightButtons()}
                    </div>}
                    <GraphsPanel
                        sensorRecordings={sensorRecordings}
                        preRecordings={preRecordings}
                        predictionState={this.state.predictionState}
                        prediction={this.state.prediction}
                        onAddPrediction={this.addPrediction}
                        onGraphZoom={this.onGraphZoom}
                        onSensorSelect={this.handleSensorSelect}
                        xStart={this.state.xStart}
                        xEnd={this.state.xEnd}
                        timeUnit={this.state.timeUnit}
                        collecting={this.state.collecting}
                        hasData={this.hasData()}
                        dataReset={this.state.dataReset}
                        assetsPath={this.assetsPath}
                        maxHeight={this.props.maxGraphHeight}
                        singleReads={singleReads}
                        secondGraph={this.state.secondGraph}
                    />
                    {this.renderLegend()}
                </div>
                {showControls &&<ControlPanel
                    isConnectorAwake={isConnectorAwake}
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
                    onSaveData={this.interactiveHost === "codap" ? this.sendData : undefined}
                    onReloadPage={this.reload}
                    onAboutClick={this.showAbout}
                    isDisabled={sensorManager == null}
                    predictionStatus={this.state.predictionState}
                    onClearPrediction={clearPrediction}
                    onSavePrediction={savePrediction}
                    assetsPath={this.assetsPath}
                    singleReads={singleReads}
                />}
            </div>
        );
    }
}
