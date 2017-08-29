import * as React from "react";
import Modal from "react-modal";
import { Sensor } from "../models/sensor";
import { SensorGraph } from "./sensor-graph";
import { ControlPanel } from "./control-panel";
import { Codap } from "../models/codap";
import { SensorStrings, SensorDefinitions } from "../models/sensor-definitions";
import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";

const SENSOR_IP = "http://127.0.0.1:11180";

export interface AppProps {}

export interface AppState {
    sensorType:string;
    valueUnits:string[];
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

export class App extends React.Component<AppProps, AppState> {
    
    private sensorConnector:SensorConnectorInterface;
    private sensor1:Sensor;
    private sensor2:Sensor;
    private lastDataIndex:number;
    private lastTime:number;
    private codap:Codap;
    private selectionRange:{start:number,end:number|undefined} = {start:0,end:undefined};
    private disableWarning:boolean = false;
    private sensorDataByType:any;
    
    constructor(props: AppProps) {
        super(props);
        this.state = {
            sensorType:"",
            valueUnits:[],
            hasData:false,
            dataChanged:false,
            dataReset:false,
            collecting:false,
            runLength:10,
            xStart:0,
            xEnd:11,
            timeUnit:"",
            warnNewModal:false,
            reconnectModal:false,
            statusMessage:undefined,
            secondGraph:false
        };
        
        this.sensor1 = new Sensor();
        this.sensor2 = new Sensor();
        
        this.sensorDataByType = {};
        
        this.connectCodap = this.connectCodap.bind(this);
        this.onSensorConnect = this.onSensorConnect.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        this.onSensorCollectionStopped = this.onSensorCollectionStopped.bind(this);
        this.onSensorDisconnect = this.onSensorDisconnect.bind(this);
        
        setTimeout(this.connectCodap, 1000);
        this.sensorConnector = new SensorConnectorInterface();
        this.sensorConnector.on("datasetAdded", this.onSensorConnect);
        this.sensorConnector.on("interfaceConnected", this.onSensorConnect);
        this.sensorConnector.startPolling(SENSOR_IP);
        
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
    
    connectCodap() {
        this.codap = new Codap();
    }
    
    onSensorConnect() {
        var sensorInfo = this.sensorConnector.stateMachine.currentActionArgs[1];
        var sensorType = sensorInfo && sensorInfo.currentInterface;
        
        if(!sensorType || (sensorType === "None Found")) {
            this.setState({
                sensorType: "",
                statusMessage: SensorStrings["messages"]["no_sensors"]
            });
        }
        else {
            this.sensorConnector.off("*", this.onSensorConnect);
            console.log("sensor connected: " + sensorType);
            
            this.setState({
                statusMessage: ""
            });
            
            var timeUnit;
            var valueUnits:string[] = [];
            var curSetID = 0;
            for(var setID in sensorInfo.sets) {
                const newSetID = parseInt(setID, 10);
                if(newSetID > curSetID) {
                    curSetID = newSetID;
                }
            }
            
            var colIDs = sensorInfo.sets[curSetID].colIDs;
            colIDs.forEach((colID) => {
                var set = sensorInfo.columns[colID];
                if(set.name === "Time") {
                    timeUnit = set.units;
                } else if(valueUnits.indexOf(set.units) === -1) {
                    valueUnits.push(set.units);
                }
            });
            
            this.sensor1.valueUnit = valueUnits[0];
            this.sensor1.definition = SensorDefinitions[valueUnits[0]];
            if(valueUnits.length > 1) {
                this.sensor2.valueUnit = valueUnits[1];
                this.sensor2.definition = SensorDefinitions[valueUnits[1]];
            }
            
            this.setState({
                sensorType: sensorType,
                timeUnit: timeUnit,
                valueUnits: valueUnits
            });

            this.sensorConnector.on("data", this.onSensorData);
            this.sensorConnector.on("interfaceRemoved", this.onSensorDisconnect);
        }
    }
    
    sensorHasData():boolean {
        return (this.sensorConnector &&
                    this.sensorConnector.datasets[0] &&
                    this.sensorConnector.datasets[0].columns[1]);
    }
    
    startSensor() {
        this.sensorConnector.requestStart();
        this.setState({
            statusMessage: SensorStrings["messages"]["starting_data_collection"]
        });
    }
    
    stopSensor() {
        this.sensorConnector.requestStop();
        this.lastTime = 0;
    }
    
    onSensorCollectionStopped() {
        this.setState({
            collecting: false,
            statusMessage: SensorStrings["messages"]["data_collection_stopped"]
        });
        
        this.sensorConnector.off("collectionStopped", this.onSensorCollectionStopped);
    }
    
    onSensorData(setId:string) {
        if(!this.state.collecting) {
            this.setState({
                hasData: true,
                dataChanged: true,
                collecting: true,
                statusMessage: SensorStrings["messages"]["collecting_data"]
            });
        
            this.sensorConnector.on("collectionStopped", this.onSensorCollectionStopped);
        }
        
        var sensorInfo = this.sensorConnector.stateMachine.currentActionArgs;
        var setID = sensorInfo[1];
        // set IDs ending in 0 contain time data
        if(setID.slice(setID.length-1) === 0) {
            var timeData = sensorInfo[2];
            // make sure the sensor graph has received the update for the final value
            if(this.lastTime && this.lastTime > this.state.runLength) {
                this.stopSensor();
            } else {
                this.lastTime = timeData[timeData.length-1];
            }
        }
    }
        
    onSensorDisconnect() {
        this.setState({
            reconnectModal: true,
            valueUnits: []
        });
    }
    
    sendData() {
        var data1 = this.sensor1.sensorData.slice();
        data1 = data1.slice(this.selectionRange.start, this.selectionRange.end);
        
        if(!this.state.secondGraph) {
            this.codap.sendData(data1, this.sensor1.definition.measurementName);   
        } else {
            var data2 = this.sensor2.sensorData.slice();
            data2 = data2.slice(this.selectionRange.start, this.selectionRange.end);
            
            this.codap.sendDualData(data1, this.sensor1.definition.measurementName, 
                                data2, this.sensor2.definition.measurementName);
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
        this.setState({
            hasData:false,
            dataReset:true,
            dataChanged:false
        });
        this.lastDataIndex = 0;
        this.sensorDataByType = {};
    }    
    
    onTimeSelect(newTime:number) {
        this.setState({
            runLength: newTime,
            xStart: 0,
            xEnd: newTime * 1.2
        });
    }
    
    onGraphZoom(xStart:number, xEnd:number) {
        
        // convert from time value to index
        var i:number, entry:number[], nextEntry:number[];
        for(i=0; i < this.sensor1.sensorData.length-1; i++) {
            entry = this.sensor1.sensorData[i];
            nextEntry = this.sensor1.sensorData[i+1];
            if(entry[0] === xStart) {
                this.selectionRange.start = i;
                break;
            } else if(entry[0] < xStart && nextEntry[0] >= xStart) {
                this.selectionRange.start = i+1;
                break;
            }
        }
        for(i; i < this.sensor1.sensorData.length-1; i++) {
            entry = this.sensor1.sensorData[i];
            nextEntry = this.sensor1.sensorData[i+1];
            if(entry[0] === xEnd) {
                this.selectionRange.end = i;
                break;
            } else if(entry[0] < xEnd && nextEntry[0] >= xEnd) {
                this.selectionRange.end = i+1;
                break;
            }
        }
        
        this.setState({
            xStart: xStart,
            xEnd: xEnd,
            dataChanged: true
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
        this.onSensorConnect();
    }
    
    toggleWarning() {
        this.disableWarning = true;
    }
    
    toggleGraph() {
        this.setState({
            secondGraph: !this.state.secondGraph
        });
    }
    
    reload() {
        location.reload();
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(!prevState.dataReset && this.state.dataReset) {
            this.setState({
                dataReset:false
            });
        }
    }
    
    renderGraph(sensor:Sensor, title:string) {
        return <SensorGraph sensor={sensor}
            title={title} 
            sensorConnector={this.sensorConnector}
            onGraphZoom={this.onGraphZoom} 
            runLength={this.state.runLength}
            xStart={this.state.xStart}
            xEnd={this.state.xEnd}
            valueUnits={this.state.valueUnits}
            collecting={this.state.collecting}
            dataReset={this.state.dataReset}/>;
    }
    
    render() {
        var codapURL = window.self === window.top
                        ? "http://codap.concord.org/releases/latest?di=" + window.location.href
                        : "";
        return (
            <div>
                <Modal contentLabel="Discard data?" 
                    isOpen={this.state.warnNewModal}
                    style={{
                        content: {
                            bottom: "auto"
                        }
                    }}>
                    <p>{SensorStrings["messages"]["check_save"]}</p>
                    <input type="checkbox" 
                        onChange={this.toggleWarning}/><label>Don't show this message again</label>
                    <hr/>
                    <button 
                        onClick={this.closeWarnNewModal}>Go back</button>
                    <button
                        onClick={this.discardData}>Discard the data</button>
                </Modal>
                <Modal contentLabel="Sensor not attached" 
                    isOpen={this.state.reconnectModal}
                    style={{
                        content: {
                            bottom: "auto"
                        }
                    }}>
                    <p>{SensorStrings["messages"]["sensor_not_attached"]}</p>
                    
                    <hr/>
                    <button 
                        onClick={this.tryReconnectModal}>Try again</button>
                </Modal>
                <div>
                    <input type="checkbox" 
                        id="toggleGraphBtn"
                        onClick={this.toggleGraph} />
                        Two sensors
                </div>
                <div>{this.state.statusMessage}</div>
                {this.renderGraph(this.sensor1, "graph1")}
                {this.state.secondGraph ? this.renderGraph(this.sensor2, "graph2"): null}
                <ControlPanel   sensorType={this.state.sensorType}
                                collecting={this.state.collecting}
                                hasData={this.state.hasData}
                                dataChanged={this.state.dataChanged}
                                duration={10} durationUnit="s"
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
