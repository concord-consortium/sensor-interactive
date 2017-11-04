import { SensorConfiguration } from "./sensor-configuration";

export interface NewSensorData {
  [key:string]: number[][];
}

export interface SensorManagerListeners {
  onSensorConnect? : (sensorConfig: SensorConfiguration) => void;
  onSensorData? : (newData:NewSensorData) => void;
  onSensorCollectionStopped?: () => void;
  onSensorStatus?: (sensorConfig:SensorConfiguration) => void;
}

export interface ISensorManager {
  listeners:SensorManagerListeners;
  startPolling() : void;
  sensorHasData() : boolean;
  requestStart() : void;
  requestStop() : void;
}
