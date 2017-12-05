import { SensorConfiguration } from "./sensor-configuration";

export interface NewSensorData {
  [key:string]: number[][];
}

type OnSensorConnectFunction = (sensorConfig: SensorConfiguration) => void;
type OnSensorDataFunction = (newData:NewSensorData) => void;
type OnSensorCollectionStoppedFunction = () => void;
type OnSensorStatusFunction = (sensorConfig:SensorConfiguration) => void;
type ListenerFunction = OnSensorConnectFunction | OnSensorDataFunction |
  OnSensorCollectionStoppedFunction | OnSensorStatusFunction;

export abstract class SensorManager {
  abstract startPolling() : void;
  abstract hasSensorData() : boolean;
  abstract requestStart() : void;
  abstract requestStop() : void;

  private readonly listeners : Map<string, Set<any>> = new Map();

  addListener(type: string, handler: ListenerFunction) {
    let listenersOfType = this.listeners.get(type);
    if(listenersOfType === undefined){
      listenersOfType = new Set();
      this.listeners.set(type, listenersOfType);
    }
    listenersOfType.add(handler);
  }

  removeListener(type: string, handler: ListenerFunction) {
    let listenersOfType = this.listeners.get(type);
    if(listenersOfType === undefined){
      return;
    }
    listenersOfType.delete(handler);
  }

  protected notifyListeners(type: string, ...args: any[]) {
    let listenersOfType = this.listeners.get(type);
    if(listenersOfType === undefined){
      return;
    }
    listenersOfType.forEach((handler) => {
      // TODO what should 'this' be here?
      handler.apply(null, args);
    });
  }

  protected onSensorConnect(sensorConfig: SensorConfiguration) {
    this.notifyListeners('onSensorConnect', sensorConfig);
  }

  protected onSensorData(newData:NewSensorData) {
    this.notifyListeners('onSensorData', newData);
  }

  protected onSensorCollectionStopped() {
    this.notifyListeners('onSensorCollectionStopped');
  }

  protected onSensorStatus(sensorConfig:SensorConfiguration) {
    this.notifyListeners('onSensorStatus', sensorConfig);
  }
}
