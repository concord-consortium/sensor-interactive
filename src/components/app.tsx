import * as React from "react";
import { Title } from "./title";
import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";

export interface AppProps {};

export interface AppState {
    sensorActive: boolean;
};

const SENSOR_IP = "http://127.0.0.1:11180";

export interface AppState {
    sensorActive:boolean,
    sensorValue:number|undefined
}

export class App extends React.Component<AppProps, AppState> {
    
    private sensor:SensorConnectorInterface;
    
    constructor(props: AppProps) {
        super(props);
        this.state = {
            sensorActive:false,
            sensorValue:undefined
        };
        this.sensor = new SensorConnectorInterface();
        this.sensor.on("*", (e)=> {
            this.setState({
                sensorActive:this.sensorHasData(),
                sensorValue:this.getSensorValue()
            });
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
    
    renderSensorValue() {
        return (
            <div>
                <label>Reading:</label>
                <span>{this.state.sensorActive && this.state.sensorValue}</span>
            </div>
        );
    }

    render() {
        return (
            <div>
                <Title />
                {this.renderSensorValue()}
            </div>
        );
    }
    
}