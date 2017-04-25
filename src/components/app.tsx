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
    collecting:boolean
}

export class App extends React.Component<AppProps, AppState> {
    
    private sensor:SensorConnectorInterface;
    private sensorColumnLengths:number[] = [];
    private codap:Codap;
    
    constructor(props: AppProps) {
        super(props);
        this.state = {
            sensorActive:false,
            sensorValue:undefined,
            sensorData:[], // can't create graph with empty data set
            collecting:false
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
    }
    
    stopSensor() {
        this.sensor.requestStop();
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
        this.codap.sendData(this.state.sensorData);
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
        return <Graph data={this.state.sensorData}/>
    }

    render() {
        return (
            <div>
                <div>
                    <Title />
                    {this.renderSensorValue()}
                </div>
                {this.renderGraph()}
                <div>
                    <button id="startSensor" onClick={()=>{this.startSensor()}}>Start</button>
                    <button id="stopSensor" onClick={()=>{this.stopSensor()}}>Stop</button>
                    <button id="sendData" onClick={()=>{this.sendData()}}>Save Data</button>
                </div>
            </div>
        );
    }
    
}