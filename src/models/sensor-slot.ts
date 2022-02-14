import { Sensor } from "./sensor";

export class SensorSlot {
  slotIndex:number;
  sensor:Sensor;

  constructor(index:number, sensor:Sensor) {
    this.slotIndex = index;
    this.sensor = sensor;
  }

  get isConnected() {
    return this.sensor.isConnected;
  }

  setSensor(sensor:Sensor) {
    this.sensor = sensor;
  }
}
