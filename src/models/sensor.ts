import { SensorDefinition } from "@concord-consortium/sensor-connector-interface";

export class Sensor {
    columnID?:string;
    sensorPosition?:number; // index in received dataColumns array
    sensorValue?:number;
    dataChanged:boolean;
    tareValue:number;
    timeUnit:string;
    valueUnit:string;
    definition:SensorDefinition;

    constructor() {
        this.tareValue = 0;
        this.definition = {
            sensorName:"",
            measurementName:"",
            measurementType:"",
            minReading:0,
            maxReading:10,
            tareable:false
        };
    }

    get isConnected() {
        return !!this.columnID && !!this.valueUnit;
    }

    zeroSensor() {
        if (this.sensorValue != null) {
            this.tareValue = this.sensorValue;
        }
    }

}
