import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import { NewSensorData, SensorManager } from "./sensor-manager";
import { SensorConfiguration } from "./sensor-configuration";

interface HeartRateData {
  heartRate: number;
  contactDetected?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}

// Helper function for debugging
function toPaddedHexString(num:number) : string {
  let str = num.toString(16);
  return "0".repeat(2 - str.length) + str;
};

export class HeartRateSensorManager extends SensorManager {
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | undefined;
  _characteristic: BluetoothRemoteGATTCharacteristic | undefined;

  private internalConfig: SensorConfig;
  private hasData: boolean = false;
  private stopRequested: boolean = false;

  supportsDualCollection = false;

  constructor() {
    super();

    this.internalConfig = {
      collection:{ canControl:true, isCollecting:false },
      columnListTimeStamp: new Date(),
      columns:{
        "100": {
          id: "100",
          setID: "100",
          position: 0,
          name: "Time",
          units: "s",
          liveValue: "NaN",
          liveValueTimeStamp: new Date(),
          valueCount: 0,
          valuesTimeStamp: new Date()
        },
        "101": {
          id: "101",
          setID: "100",
          position: 1,
          name: "Heart Rate",
          units: "bpm",
          liveValue: "NaN",
          liveValueTimeStamp: new Date(),
          valueCount: 0,
          valuesTimeStamp: new Date()
        }
       },
      currentInterface: "Vernier Go Wireless Heart Rate",
      currentState: "unknown",
      os: { name: "Fake", version: "1.0.0"},
      requestTimeStamp: new Date(),
      server: { arch: "Fake", version: "1.0.0" },
      sessionDesc: "Fake",
      sessionID: "1234",
      sets:{
        "100": {
          name: "Run 1",
          colIDs: [100, 101]
        }
      }
    };

    this.supportsHeartbeat = true;
  }

  async connectToDevice(wirelessDevice: BluetoothDevice): Promise<boolean> {
    this.device = wirelessDevice;

    // Connect to device
    this.server = await this.device?.gatt?.connect();

    // Resend the sensorconfig so the UI updates after the connection
    this.sendSensorConfig(true);

    // Get the Service
    const service = await this.server?.getPrimaryService("heart_rate");

    // Get and save data characteristic
    this._characteristic = await service?.getCharacteristic('heart_rate_measurement');
    if (!this._characteristic) { return false };

    await this.startNotifications();;
    this.handleHeartRateMeasurement(this._characteristic);

    return true;
  }

  async disconnectFromDevice() {
    if (this._characteristic) {
      await this.stopNotifications();
    }
    this.device?.gatt?.disconnect();
    // Resend the sensorconfig so the UI updates after the disconnection
    this.sendSensorConfig(true);
  }

  handleHeartRateMeasurement(heartRateMeasurement: BluetoothRemoteGATTCharacteristic) {
    heartRateMeasurement.addEventListener('characteristicvaluechanged', (event: any) => {
      const heartRateMeasurement = this.parseHeartRate(event.target?.value).heartRate;
      this.printByteArray(event.target?.value);
      if (heartRateMeasurement !== undefined && heartRateMeasurement !== 0) {
        this.internalConfig.columns[101].liveValue = heartRateMeasurement.toString();
        this.onSensorStatus(new SensorConfiguration(this.internalConfig));
      }
    });
  }

  parseHeartRate (value: any) {
    // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
    value = value.buffer ? value : new DataView(value);
    let flags = value.getUint8(0);
    let rate16Bits = flags & 0x1;
    let result: Partial<HeartRateData> = {};
    let index = 1;
    if (rate16Bits) {
      result.heartRate = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    } else {
      result.heartRate = value.getUint8(index);
      index += 1;
    }
    let contactDetected = flags & 0x2;
    let contactSensorPresent = flags & 0x4;
    if (contactSensorPresent) {
      result.contactDetected = !!contactDetected;
    }
    let energyPresent = flags & 0x8;
    if (energyPresent) {
      result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    }
    let rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      let rrIntervals = [];
      for (; index + 1 < value.byteLength; index += 2) {
        rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
      }
      result.rrIntervals = rrIntervals;
    }
    return result;
  }


  startNotifications () {
    return this._characteristic?.startNotifications()
    .then(() => this._characteristic);
  }

  stopNotifications() {
    return this._characteristic?.stopNotifications()
    .then(() => this._characteristic);
  }

  sendSensorConfig(includeOnConnect:boolean) {
    let sensorConfig = new SensorConfiguration(this.internalConfig);
    if (includeOnConnect) {
      this.onSensorConnect(sensorConfig);
    }
    this.onSensorStatus(sensorConfig);
  }

  startPolling() {
    setTimeout(() => {
      this.sendSensorConfig(true);
    }, 10);
    setInterval(() => {
      // resend the sensorConfig so we will know if the device is disconnected
      // This could be smarter if it keeps track of which sensors have been
      // enabled on the device
      this.sendSensorConfig(false);
    }, 1000);
  }

  requestStart() {
    let startCollectionTime = Date.now();

    const readData = async () => {
      // use one time for all readings so when doing a multi sensor export
      // the readings match up
      const time = Date.now() - startCollectionTime;

      const data:NewSensorData = {};
      const value = Number(this.internalConfig.columns["101"].liveValue);
      this.onSensorStatus(new SensorConfiguration(this.internalConfig));

      this.hasData = true;
      data["101"] = [[time / 1000, value]];
      this.onSensorData(data);

      if(!this.stopRequested) {
        // Repeat
        setTimeout(readData, 100);
      } else {
        this.onSensorCollectionStopped();
        this.stopRequested = false;
      }
    };

    readData();
  }

  requestStop() {
    this.stopRequested = true;
  }

  printByteArray(byteArray:DataView) {
    let hex:string = "";
    for(let i=0; i < byteArray.byteLength; i++) {
      hex += toPaddedHexString(byteArray.getUint8(i));
    }
    console.log(`read bytes: ${hex}`);
  }

  static getOptionalServices() {
    return ['heart_rate'];
  }

  static getWirelessFilters() {
    return [{ services: ['heart_rate'] }];
  }

  hasSensorData(): boolean {
    return this.hasData;
  }

  isWirelessDevice(): boolean {
    return true;
  }

  requestHeartbeat(enabled: boolean): void {
  }
};