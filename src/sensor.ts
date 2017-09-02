import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";
/*
declare var sensorConnectorInterface: any
*/

const SENSOR_IP = "http://127.0.0.1:11180";

export class Sensor {
    
    private sensorInterface: any;
    
    constructor() {        
        this.sensorInterface = new SensorConnectorInterface();
        this.sensorInterface.startPolling(SENSOR_IP);
        this.sensorInterface.on("*", (e:any) => {
            console.log("sensor data: " + e);
            console.log(" - connected: " + this.isConnected());
            console.log(" - val: " + this.getLiveValue());
        });
    }
    
    isConnected():boolean {
        return this.sensorInterface.isConnected;
    }
    
    getLiveValue():number {
        var val = -1;
        if(this.sensorInterface.datasets[0] && this.sensorInterface.datasets[0].columns[1])
            val = this.sensorInterface.datasets[0].columns[1].liveValue;
        
        return val;
    }
}