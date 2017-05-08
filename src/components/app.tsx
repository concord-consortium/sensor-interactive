import * as React from "react";
import * as ReactModal from 'react-modal';
import { Title } from "./title";
import { Graph } from "./graph";
import { Codap } from "./codap";
import { SensorDefinitions } from "./sensor-definitions";
import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";

const SENSOR_IP = "http://127.0.0.1:11180";

export interface AppProps {};

export interface AppState {
    sensorType:string,
    sensorActive:boolean,
    sensorValue:number|undefined,
    sensorData:number[][],
    dataChanged:boolean,
    collecting:boolean,
    runLength:number,
    minReading:number,
    maxReading:number,
    tareValue:number,
    timeUnit:string,
    valueUnit:string,
    measurementName:string,
    warnNewModal:boolean
}

export class App extends React.Component<AppProps, AppState> {
    
    private sensor:SensorConnectorInterface;
    private lastDataIndex:number;
    private codap:Codap;
    private selectionRange:{start:number,end:number|undefined} = {start:0,end:undefined};
    private stopTimer:number;
    private disableWarning:boolean = false;
    
    constructor(props: AppProps) {
        super(props);
        this.state = {
            sensorType:"",
            sensorActive:false,
            sensorValue:undefined,
            sensorData:[],
            dataChanged:false,
            collecting:false,
            runLength:10,
            minReading:0,
            maxReading:10,
            tareValue:0,
            timeUnit:"",
            valueUnit:"",
            measurementName:"",
            warnNewModal:false
        };
        
        this.codap = new Codap();
        
        this.onSensorConnect = this.onSensorConnect.bind(this);
        this.onSensorStatus = this.onSensorStatus.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        
        this.sensor = new SensorConnectorInterface();
        this.sensor.on("*", this.onSensorConnect);
        this.sensor.startPolling(SENSOR_IP);
        
        this.zeroSensor = this.zeroSensor.bind(this);
        this.onTimeSelect = this.onTimeSelect.bind(this);
        this.onGraphZoom = this.onGraphZoom.bind(this);
        this.startSensor = this.startSensor.bind(this);
        this.stopSensor = this.stopSensor.bind(this);
        this.sendData = this.sendData.bind(this);
        this.checkNewData = this.checkNewData.bind(this);
        this.closeWarnNewModal = this.closeWarnNewModal.bind(this);
        this.discardData = this.discardData.bind(this);
        this.toggleWarning = this.toggleWarning.bind(this);
        this.reload = this.reload.bind(this);
    }
    
    onSensorConnect(e) {
        var sensorInfo = this.sensor.stateMachine.currentActionArgs[1];
        var sensorType = sensorInfo.currentInterface;
        if(sensorType != "None Found") {
            this.sensor.off("*", this.onSensorConnect);
            this.setState({sensorActive:true});
            console.log("sensor connected: " + sensorType);
            
            for(var setID in sensorInfo.columns) {
                var timeUnit, valueUnit;
                var set = sensorInfo.columns[setID];
                if(set.name == "Time") {
                    timeUnit = set.units;
                } else {
                    valueUnit = set.units;
                    break;
                }
            }
            
            var sensorDef = SensorDefinitions[valueUnit];
            
            this.setState({
                sensorType: sensorType,
                timeUnit: timeUnit,
                valueUnit: valueUnit,
                minReading: sensorDef.minReading,
                maxReading: sensorDef.maxReading,
                measurementName: sensorDef.measurementName
            })
            
            this.sensor.on("statusReceived", this.onSensorStatus);
            this.sensor.on("data", this.onSensorData);
        }
    }
    
    onSensorStatus(e) {
        var liveValue = this.sensor.stateMachine.datasets[0].columns[1].liveValue;
        this.setState({sensorValue: liveValue});
    }
    
    sensorHasData():boolean {
        return (this.sensor && this.sensor.datasets[0] && this.sensor.datasets[0].columns[1]);
    }
    
    getSensorValue():number {
        var val = -1;
        if(this.sensorHasData())
            val = this.sensor.datasets[0].columns[1].liveValue;
        
        return val;
    }
    
    zeroSensor() {
        this.setState({
            tareValue: this.getSensorValue()
        });
    }
    
    startSensor() {
        this.sensor.requestStart();
        this.setState({
            collecting: true
        });
        
        this.stopTimer = setTimeout(()=>{
            this.stopSensor();
        }, this.state.runLength * 1000);
    }
    
    stopSensor() {
        this.sensor.requestStop();
        this.setState({
            collecting: false
        });
        clearTimeout(this.stopTimer);
    }
    
    onSensorData(setId:string) {
        var dataset;
        for(var i=0; i < this.sensor.datasets.length; i++) {
            if(this.sensor.datasets[i].id == setId) {
                dataset = this.sensor.datasets[i];
                break;
            }
        }
        if(dataset == undefined) {
            return;
        }
        
        var timeColumn = dataset.columns[0].data;
        var valueColumn = dataset.columns[1].data;
        
        // columns aren't always updated together
        var newLength = Math.min(timeColumn.length, valueColumn.length);
        
        if (this.lastDataIndex === undefined) {
            this.lastDataIndex = 0;
            this.setState({
                timeUnit: dataset.columns[0].units,
                valueUnit: dataset.columns[1].units
            });
        }                    

        // check there's new data for this column
        if (newLength > this.lastDataIndex) {
            var newTimeData = timeColumn.slice(this.lastDataIndex, newLength);
            var newValueData = valueColumn.slice(this.lastDataIndex, newLength);
            
            var updatedData = this.state.sensorData.slice();
            for(var i=0; i < newTimeData.length; i++) {
                var time = Number(newTimeData[i].toFixed(2));
                var value = newValueData[i] - this.state.tareValue;

                updatedData.push([time, value]);
            }
            this.setState({
                sensorData: updatedData,
                dataChanged: true
            });
            this.lastDataIndex = newLength;
        }
    }
    
    sendData() {
        var data = this.state.sensorData.slice();
        data = data.slice(this.selectionRange.start, this.selectionRange.end);
        
        this.codap.sendData(data);
        
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
            sensorData: [],
            dataChanged:false
        });
        this.lastDataIndex = 0;
    }    
    
    onTimeSelect(event:React.FormEvent<HTMLSelectElement>) {
        this.setState({runLength:parseInt(event.currentTarget.value,10)});
    }
    
    onGraphZoom(xStart:number, xEnd:number) {
        
        // convert from time value to index
        var i:number, entry:number[], nextEntry:number[];
        for(i=0; i < this.state.sensorData.length-1; i++) {
            entry = this.state.sensorData[i];
            nextEntry = this.state.sensorData[i+1];
            if(entry[0] == xStart) {
                this.selectionRange.start = i;
                break;
            } else if(entry[0] < xStart && nextEntry[0] >= xStart) {
                this.selectionRange.start = i+1;
                break;
            }
        }
        for(i; i < this.state.sensorData.length-1; i++) {
            entry = this.state.sensorData[i];
            nextEntry = this.state.sensorData[i+1];
            if(entry[0] == xEnd) {
                this.selectionRange.end = i;
                break;
            } else if(entry[0] < xEnd && nextEntry[0] >= xEnd) {
                this.selectionRange.end = i+1;
                break;
            }
        }
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
    
    toggleWarning() {
        this.disableWarning = true;
    }
    
    reload() {
        location.reload();
    }
    
    renderSensorValue() {
        var reading = "";
        if(this.state.sensorActive && this.state.sensorValue) {
            reading = (this.state.sensorValue - this.state.tareValue).toFixed(5);
        }
            
        return (
            <div>
                <label>Reading:</label>
                <span>{reading + " " + this.state.valueUnit}</span>
                <button id="zeroBtn" onClick={this.zeroSensor}>Zero</button>
            </div>
        );
    }
    
    renderGraph() {
        return <Graph 
                   data={this.state.sensorData} 
                   onZoom={this.onGraphZoom}
                   xMax={this.state.runLength}
                   yMin={this.state.minReading}
                   yMax={this.state.maxReading}
                   xLabel={"Time (" + this.state.timeUnit + ")"} 
                   yLabel={this.state.measurementName + " (" + this.state.valueUnit + ")"}/>
    }
    
    renderControls() {
        var hasData:boolean = this.state.sensorData.length > 0;
        return <div>
            <select id="timeSelect" onChange={ this.onTimeSelect } defaultValue="10">
                <option value="1">{"1.0" + this.state.timeUnit}</option>
                <option value="5">{"5.0" + this.state.timeUnit}</option>
                <option value="10">{"10.0" + this.state.timeUnit}</option>
                <option value="15">{"15.0" + this.state.timeUnit}</option>
                <option value="20">{"20.0" + this.state.timeUnit}</option>
                <option value="30">{"30.0" + this.state.timeUnit}</option>
                <option value="45">{"45.0" + this.state.timeUnit}</option>
                <option value="60">{"60.0" + this.state.timeUnit}</option>
            </select>
            <button id="startSensor" 
                onClick={this.startSensor}
                disabled={this.state.collecting}>Start</button>
            <button id="stopSensor" 
                onClick={this.stopSensor}
                disabled={!this.state.collecting}>Stop</button>
            <button id="sendData" 
                onClick={this.sendData} 
                disabled={!(hasData && this.state.dataChanged) || this.state.collecting}>Save Data</button>
            <button id="newData" 
                onClick={this.checkNewData} 
                disabled={!hasData || this.state.collecting}>New Run</button>
            </div>
    }

    render() {
        return (
            <div>
                <ReactModal contentLabel="Discard data?" 
                    isOpen={this.state.warnNewModal}
                    style={{
                        content: {
                            bottom: "auto"
                        }
                    }}>
                    <p>Pressing New Run without pressing Save Data will discard the current data. Set up a new run without saving the data first?</p>
                    <input type="checkbox" 
                        onChange={this.toggleWarning}/><label>Don't show this message again</label>
                    <hr></hr>
                    <button 
                        onClick={this.closeWarnNewModal}>Go back</button>
                    <button
                        onClick={this.discardData}>Discard the data</button>
                </ReactModal>
                <div>
                    <button
                        onClick={this.reload}>Reload</button>
                    <Title sensorType={this.state.sensorType}/>
                    {this.renderSensorValue()}
                </div>
                {this.renderGraph()}
                {this.renderControls()}
            </div>
        );
    }
    
}