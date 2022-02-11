import { Sensor } from "./sensor";

export class SensorSlot {
  slotIndex:number;
  sensor:Sensor;
  dataSensor?:Sensor;

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

  get sensorForData() {
    return this.dataSensor || this.sensor;
  }

  /*
  get hasData():boolean {
    return !!(this.sensorData && this.sensorData.length);
  }

  get numDataPoints():number {
    return this.sensorData?.length || 0;
  }

  get timeOfLastData() {
    const sensorData = this.sensorData;
    if(sensorData.length > 0) {
      return sensorData[sensorData.length - 1][0];
    }

    return 0;
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
  */
}
