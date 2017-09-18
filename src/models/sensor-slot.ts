import { Sensor } from "./sensor";

export class SensorSlot {
  slotIndex:number;
  sensor:Sensor;
  sensorData:number[][];

  constructor(index:number, sensor:Sensor) {
    this.slotIndex = index;
    this.sensor = sensor;
    this.sensorData = [];
  }

  get isConnected() {
    return this.sensor.isConnected;
  }

  setSensor(sensor:Sensor) {
    this.sensor = sensor;
  }

  setData(sensorData:number[][]) {
    this.sensorData = sensorData;
  }
}
