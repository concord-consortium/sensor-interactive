import * as React from "react";
import { Title } from "./title";
import { Graph } from "./graph";
import { Codap } from "./codap";
import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";

const SENSOR_IP = "http://127.0.0.1:11180";

export interface AppProps {};

export interface AppState {
    sensorActive:boolean,
    sensorValue:number|undefined,
    sensorData:number[][],
    dataChanged:boolean,
    collecting:boolean,
    runLength:number,
    tareValue:number
}

export class App extends React.Component<AppProps, AppState> {
    
    private sensor:SensorConnectorInterface;
    private lastDataIndex:number;
    private codap:Codap;
    private selectionRange:{start:number,end:number|undefined} = {start:0,end:undefined};
    private stopTimer:number;
    
    constructor(props: AppProps) {
        super(props);
        this.state = {
            sensorActive:false,
            sensorValue:undefined,
            sensorData:[],
            dataChanged:false,
            collecting:false,
            runLength:10,
            tareValue:0
        };
        
        this.codap = new Codap();
        
        this.onSensorConnect = this.onSensorConnect.bind(this);
        this.onSensorStatus = this.onSensorStatus.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        
        this.sensor = new SensorConnectorInterface();
        this.sensor.on("*", this.onSensorConnect);
        this.sensor.on("statusReceived", this.onSensorStatus);
        this.sensor.on("data", this.onSensorData);
        this.sensor.startPolling(SENSOR_IP);
        
        this.zeroSensor = this.zeroSensor.bind(this);
        this.onTimeSelect = this.onTimeSelect.bind(this);
        this.onGraphZoom = this.onGraphZoom.bind(this);
        this.startSensor = this.startSensor.bind(this);
        this.stopSensor = this.stopSensor.bind(this);
        this.sendData = this.sendData.bind(this);
        this.newData = this.newData.bind(this);
    }
    
    onSensorConnect(e) {
        console.log("sensor connect")
        this.sensor.off("*", this.onSensorConnect);
        this.setState({sensorActive:true});
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
    
    newData() {
        this.setState({
            sensorData: [],
            dataChanged: false
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
    
    renderSensorValue() {
        var reading = "";
        if(this.state.sensorActive && this.state.sensorValue) {
            reading = (this.state.sensorValue - this.state.tareValue).toFixed(5);
        }
            
        return (
            <div>
                <label>Reading:</label>
                <span>{reading}</span>
                <button id="zeroBtn" onClick={this.zeroSensor}>Zero</button>
            </div>
        );
    }
    
    renderGraph() {
        return <Graph 
                   data={this.state.sensorData} 
                   onZoom={this.onGraphZoom}
                   xMax={this.state.runLength}/>
    }
    
    renderControls() {
        var hasData:boolean = this.state.sensorData.length > 0;
        return <div>
            <select id="timeSelect" onChange={ this.onTimeSelect }>
                <option value="1">1.0</option>
                <option value="5">5.0</option>
                <option value="10">10.0</option>
                <option value="15">15.0</option>
                <option value="20">20.0</option>
                <option value="30">30.0</option>
                <option value="45">45.0</option>
                <option value="60">60.0</option>
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
                onClick={this.newData} 
                disabled={!hasData || this.state.collecting}>New Run</button>
            </div>
    }

    render() {
        return (
            <div>
                <div>
                    <Title />
                    {this.renderSensorValue()}
                </div>
                {this.renderGraph()}
                {this.renderControls()}
            </div>
        );
    }
    
}