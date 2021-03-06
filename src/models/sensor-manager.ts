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

// This is an optional interface for sensor devices that require
// connecting to them.
export interface ConnectableSensorManager {
  // The sensor-interactive code will use connectToDevice to determine
  // if the sensorManager instance implements ConnectableSensorManager
  // typescript doesn't have runtime type checking
  connectToDevice: (device?: any) => Promise<boolean>;
  disconnectFromDevice: () => void;
  deviceConnected: boolean;
}

export abstract class SensorManager {
  supportsDualCollection: boolean;

  abstract startPolling() : void;
  abstract hasSensorData() : boolean;
  abstract requestStart() : void;
  abstract requestStop() : void;
  abstract isWirelessDevice() : boolean;

  isAwake() : boolean {
    return true;
  }

  // derived classes should override if they have an appropriate implementation,
  // e.g. quit SensorConnector application, enter a low-power mode, etc.
  requestSleep() : void {
    // no base class implementation
    return;
  }

  // derived classes should override if they have an appropriate implementation,
  // e.g. open SensorConnector application, exit a low-power mode, etc.
  // returns true if already awake, false if launch/wake required.
  requestWake() : boolean {
    // true indicates already awake
    return true;
  }

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

  protected onSensorDisconnect() {
    this.notifyListeners('onSensorDisconnect');
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

  protected onCommunicationError() {
    this.notifyListeners('onCommunicationError');
  }
}
