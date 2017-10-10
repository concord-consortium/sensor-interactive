import { Sensor } from "./sensor";
import { cloneDeep } from "lodash";

export class SensorSlot {
  slotIndex:number;
  sensor:Sensor;
  sensorData:number[][];
  dataSensor?:Sensor;

  constructor(index:number, sensor:Sensor) {
    this.slotIndex = index;
    this.sensor = sensor;
    this.sensorData = [];
  }

  get isConnected() {
    return this.sensor.isConnected;
  }

  get hasData():boolean {
    return !!(this.sensorData && this.sensorData.length);
  }

  get sensorForData() {
    return this.dataSensor || this.sensor;
  }

  setSensor(sensor:Sensor) {
    this.sensor = sensor;
  }

  clearData() {
    this.sensorData = [];
    this.dataSensor = undefined;
  }

  setData(sensorData:number[][]) {
    this.sensorData = sensorData;
    // capture the sensor used to collect the data
    this.dataSensor = cloneDeep(this.sensor);
  }

  appendData(newData:number[][]) {
    Array.prototype.push.apply(this.sensorData, newData);
    if (!this.dataSensor)
      this.dataSensor = cloneDeep(this.sensor);
  }
}
