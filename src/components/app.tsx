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
    sensorData:(number|Date)[][],
    collecting:boolean,
    runLength:number
}

export class App extends React.Component<AppProps, AppState> {
    
    private sensor:SensorConnectorInterface;
    private sensorColumnLengths:number[] = [];
    private codap:Codap;
    private selectionRange:{start:number,end:number|undefined} = {start:0,end:undefined};
    private stopTimer:number;
    
    constructor(props: AppProps) {
        super(props);
        this.state = {
            sensorActive:false,
            sensorValue:undefined,
            sensorData:[],
            collecting:false
            runLength:10
        };
        
        this.codap = new Codap();
        
        this.sensor = new SensorConnectorInterface();
        this.sensor.on("*", (e)=> {
            this.setState({
                sensorActive:this.sensorHasData(),
                sensorValue:this.getSensorValue()
            });
            this.onSensorData(e);
        });
        this.sensor.startPolling(SENSOR_IP);
        this.onTimeSelect = this.onTimeSelect.bind(this);
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
        this.sensor.datasets.forEach(function(dataset) {

            dataset.columns.forEach(function(column, columnIndex) {
                
                var lastLength = this.sensorColumnLengths[column.id];
                if (lastLength === undefined) {
                    lastLength = this.sensorColumnLengths[column.id] = 0;
                }                    

                // check there's new data for this column
                if (column.data.length > lastLength) {
                    if(columnIndex == 0) return; //time data
                    
                    var newData = column.data.slice(lastLength);

                    // add new data to the graph
                    var updatedData = this.state.sensorData;
                    newData.forEach(function(data, rowIndex) {
                        updatedData.push([updatedData.length, data]);
                    });
                    this.setState({
                        sensorData: updatedData
                    });
                    this.render();
                    this.sensorColumnLengths[column.id] = column.data.length;
                }
            }, this);
        }, this);
    }
    
    sendData() {
        var data = this.state.sensorData.slice();
        if(this.selectionRange && this.selectionRange.start && this.selectionRange.end) {
            data = data.slice(this.selectionRange.start, this.selectionRange.end);
        }
        this.codap.sendData(data);
    }
    
    newData() {
        this.setState({sensorData:[]});
    }    
    
    onTimeSelect(event:React.FormEvent<HTMLSelectElement>) {
        this.setState({runLength:parseInt(event.currentTarget.value,10)});
    }
    
    onGraphZoom(xStart:number, xEnd:number) {
        this.selectionRange.start = xStart;
        this.selectionRange.end = xEnd;
    }
    
    renderSensorValue() {
        return (
            <div>
                <label>Reading:</label>
                <span>{this.state.sensorActive && this.state.sensorValue}</span>
            </div>
        );
    }
    
    renderGraph() {
        return <Graph data={this.state.sensorData} onZoom={(start:number,end:number)=>{this.onGraphZoom(start,end)}}/>
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
                onClick={()=>{this.startSensor()}}
                disabled={this.state.collecting}>Start</button>
            <button id="stopSensor" 
                onClick={()=>{this.stopSensor()}}
                disabled={!this.state.collecting}>Stop</button>
            <button id="sendData" 
                onClick={()=>{this.sendData()}} 
                disabled={!hasData || this.state.collecting}>Save Data</button>
            <button id="newData" 
                onClick={()=>{this.newData()}} 
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