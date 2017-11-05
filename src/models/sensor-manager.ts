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
  supportsDualCollection: boolean;
  startPolling() : void;
  sensorHasData() : boolean;
  requestStart() : void;
  requestStop() : void;
  connectToDevice?: () => void;
  disconnectFromDevice?: () => void;
  deviceConnected?: boolean;
}
