import { Sensor } from "./sensor";
import { cloneDeep } from "lodash";

export class SensorSlot {
  slotIndex:number;
  sensor:Sensor;
  sensorData:number[][];
  dataSensor?:Sensor;
  numRequestedDataPoints:number;
  firstDataPointTimestamp:number;

  constructor(index:number, sensor:Sensor) {
    this.slotIndex = index;
    this.sensor = sensor;
    this.sensorData = [];
    this.numRequestedDataPoints = 0;
  }

  get isConnected() {
    return this.sensor.isConnected;
  }

  get hasData():boolean {
    return !!(this.sensorData && this.sensorData.length);
  }

  get numDataPoints():number {
    return this.sensorData?.length || 0;
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

  appendData(newData:number[][], runLength:number) {
    const { tareValue } = this.sensor;

    newData.forEach( (item) => {
      const time = item[0];
      // don't include data past the end of the experiment
      if (time <= runLength) {
        let value = item[1];
        if (tareValue) {
          // Tare the data before appending it
          value -= tareValue;
        }
        this.sensorData.push([time, value]);
      }
    });

    if (!this.dataSensor)
      this.dataSensor = cloneDeep(this.sensor);
  }

  recordOneDataPointIfNeeded(newData:number[][]) {
    if (this.numDataPoints < this.numRequestedDataPoints && newData.length > 0) {
      const sample = newData[0];
      if (this.sensorData.length === 0) {
        sample[0] = 1;
        this.firstDataPointTimestamp = Date.now();
      } else {
        sample[0] = 1 + (Date.now() - this.firstDataPointTimestamp) / 1000;
      }
      this.appendData([sample], sample[0]);
    }
  }
}
