export class Sensor {
    sensorValue:number|undefined;
    sensorData:number[][];
    dataChanged:boolean;
    tareValue:number;
    timeUnit:string;
    valueUnit:string;
    definition:any;
    
    constructor() {
        this.sensorData = [];
        this.definition = {
            measurementName:"",
            minReading:0,
            maxReading:10
        };
    }
}