import { ISensorDefinition } from "./sensor-definitions";
import { Format } from "../utils/format";
import { ISensorConfigurationColumnInfo } from "./sensor-configuration";

let nextSensorId = 0;

export class Sensor {
    columnID?:string;
    id:number;
    /**
     * This is copied from the `position` of the received dataColumn.
     * {@link ISensorConfigurationColumnInfo.position} documents more about what
     * this position represents.
     */
    sensorPosition?:number;
    sensorValue?:number;
    sensorHeartbeatValue?:number;  // sampled value at intervals when heartbeat is enabled
    dataChanged:boolean;
    tareValue:number;
    timeUnit:string;
    valueUnit:string;
    definition:ISensorDefinition;

    constructor(id?: number) {
        this.tareValue = 0;
        this.id = id === undefined ? nextSensorId++ : id;
        this.definition = {
            sensorName:"",
            measurementName:"",
            measurementType:"",
            minReading:0,
            maxReading:10,
            tareable:false,
            displayUnits:""
        };
    }

    get isConnected() {
        return !!this.columnID && !!this.valueUnit;
    }

    zeroSensor() {
        const currentValue = this.sensorValue || this.sensorHeartbeatValue;
        if (currentValue != null) {
            this.tareValue = currentValue;
        }
    }

    sensorPrecision() {
        if (!this.definition)
            return 2;

        const sensorRange = this.definition.maxReading - this.definition.minReading,
              sensorPrecision = Format.getFixValue(sensorRange);
        return sensorPrecision;
    }

}
