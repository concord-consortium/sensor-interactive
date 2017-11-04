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

  get timeOfLastData() {
    const sensorData = this.sensorData;
    if(sensorData.length > 0) {
      return sensorData[sensorData.length - 1][0];
    }

    return 0;
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

  // Tare the data before appending it
  appendData(newData:number[][]) {
    const { sensor } = this;
    if(sensor.tareValue) {
      newData.forEach( (item) => {
        item[1] = item[1] - sensor.tareValue;
      });
    }

    Array.prototype.push.apply(this.sensorData, newData);
    if (!this.dataSensor)
      this.dataSensor = cloneDeep(this.sensor);
  }
}
