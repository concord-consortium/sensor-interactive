import { ISensorDefinition } from "./sensor-connector-interface";

export class Sensor {
    columnID?:string;
    sensorPosition?:number; // index in received dataColumns array
    sensorValue?:number;
    sensorData:number[][];
    dataChanged:boolean;
    tareValue:number;
    timeUnit:string;
    valueUnit:string;
    definition:ISensorDefinition;
    
    constructor() {
        this.sensorData = [];
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
        return this.columnID && this.sensorData && this.valueUnit;
    }
}