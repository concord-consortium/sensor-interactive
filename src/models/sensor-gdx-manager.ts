import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager, NewSensorData, HEARTBEAT_INTERVAL_MS } from "./sensor-manager";
import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import { IStringMap } from "./sensor-definitions";
import godirect from "@vernier/godirect"
import { cloneDeep } from "lodash";

const goDirectServiceUUID = "d91714ef-28b9-4f91-ba16-f0d9a604f112";
const goDirectDevicePrefix = "GDX";

const POLLING_INTERVAL = 1000;

// calibration display: We only need to sample at twice heartbeat rate
// This is the nyquist frequency, and insures we have at least one sample for
// each heartbeat.
const SENSOR_HEARTBEAT_INTERVAL = HEARTBEAT_INTERVAL_MS / 2;

// According to Vernier, the maximum sampling frequency got GDX-MD is 50hz
// see: https://www.vernier.com/til/5
// But we are only seeing updates at 10hz. For now we are going to use 10hz
// see: https://www.pivotaltracker.com/story/show/181528803
const READ_DATA_INTERVAL = 1000 / 10;

export const SpecialMeasurementUnits: IStringMap = {
  "Wind Speed": "m/s_WS",
  "Wind Direction": "°_WD",
  "Wind Chill": "°C_WC",
  "Heat Index": "°C_HI",
  "Dew Point": "°C_DP",
  "Relative Humidity": "%RH",
  "Station Pressure": "mbar_SP",
  "Barometric Pressure": "mbar_BP",
  "Altitude": "m_AL"
}

export class SensorGDXManager extends SensorManager {
    supportsDualCollection = true;

    private internalConfig: SensorConfig;
    private hasData: boolean = false;
    private stopRequested: boolean = false;
    private disconnectRequested: boolean = false;
    private gdxDevice: any;
    private enabledSensors: any;
    private initialColumnNum = 100;
    private timerId: any;

    constructor() {
      super();
      // create SensorConfiguration
      // This should be improved, we don't need all of these properties when making
      // a new sensor manager. The SensorConfiguration class could be have an
      // interface so then sensor managers can provide their own implementation
      this.internalConfig = {
        collection:{ canControl:true, isCollecting:false },
        columnListTimeStamp: new Date(),
        columns:{ },
        currentInterface: "Vernier Go Direct",
        currentState: "unknown",
        os: { name: "Fake", version: "1.0.0"},
        requestTimeStamp: new Date(),
        server: { arch: "Fake", version: "1.0.0" },
        sessionDesc: "Fake",
        sessionID: "1234",
        sets:{
          "100": {
            name: "Run 1",
            colIDs: [100]
          }
        }
      };

      this.supportsHeartbeat = true;
    }

    static getOptionalServices() {
      return [goDirectServiceUUID];
    }

    static getWirelessFilters() {
      return [{ namePrefix: [goDirectDevicePrefix] }];
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
        // TODO: do we need to cancel while collecting or while disconnected?
        this.pollSensor();
      }, POLLING_INTERVAL);

    }

    isWirelessDevice() {
      return true;
    }

    pollSensor() {
      const readLiveData = async () => {
        if (!this.disconnectRequested) {
          this.enabledSensors.forEach((sensor: any, index: number) => {
            const cNum = this.initialColumnNum + index;
            this.internalConfig.columns[cNum].liveValueTimeStamp = new Date();
            this.internalConfig.columns[cNum].liveValue = sensor.value?.toString() || "none";
          });
          this.sendSensorConfig(false);
        }
      };
      readLiveData();
    }

    hasSensorData() {
      return this.hasData;
    }

    requestStart() {
      let startCollectionTime = Date.now();
      this.gdxDevice.stop();
      this.gdxDevice.start(this.gdxDevice.minMeasurementPeriod);
      const readData = async () => {
        this.enabledSensors.forEach((sensor: any, index: number) => {
          const cNum = this.initialColumnNum + index;
          const time = Date.now() - startCollectionTime;
          this.updateSensorValue(cNum.toString(), time / 1000, sensor.value);
        });

        if (this.stopRequested) {
          clearInterval(this.timerId);
          this.gdxDevice.stop();
          this.onSensorCollectionStopped();
          this.stopRequested = false;
        }
      };

      this.timerId = setInterval(readData, READ_DATA_INTERVAL);

    }

    updateSensorValue(ID:string, time:number, value:number) {
      if (!value) {
        return;
      }
      this.internalConfig.columns[ID].liveValue = value.toString();
      this.hasData = true;

      this.onSensorStatus(new SensorConfiguration(this.internalConfig));
      const data:NewSensorData = {};
      data[ID] = [[time, value]];
      this.onSensorData(data);
    }

    requestStop() {
      this.stopRequested = true;
    }

    // Will also update live sensor display values for calibration.
    requestHeartbeat(enabled: boolean): void {
      if(enabled) {
        if(this.gdxDevice) {

          this.gdxDevice.start(SENSOR_HEARTBEAT_INTERVAL);
        }
      } else {
        if(this.gdxDevice) {
          this.gdxDevice.stop();
        }
      }
      this.manageHeartbeat(enabled, () => {
        if (!this.disconnectRequested) {
          const config = cloneDeep(this.internalConfig);
          this.enabledSensors.forEach((sensor: any, index: number) => {
            const cNum = this.initialColumnNum + index;
            config.columns[cNum.toString()].liveValue =
              sensor.value?.toString() || "none";
          });
          this.onSensorHeartbeat(new SensorConfiguration(config));
        }
      });
    }

    async getBatteryLevel() {
      const batteryLevel = await this.gdxDevice.getBatteryLevel();
      return batteryLevel;
    }

    getSensorUnits(sensor: any){
      if (Object.keys(SpecialMeasurementUnits).includes(sensor.name)){
        return SpecialMeasurementUnits[sensor.name];
      } else {
        return sensor.unit;
      }
    }

    async connectToDevice(device?: any): Promise<boolean> {
      this.gdxDevice = await godirect.createDevice(device, { open: true, startMeasurements: false });

      if (!this.gdxDevice) {
        console.log("Could not create GDX device");
        return false;
      }

      // log disconnection
      this.gdxDevice.on("device-closed", () => {
        if (!this.disconnectRequested) {
          // user did not request disconnect, something went wrong!
          this.disconnectRequested = true;
          this.clearConfigLiveValues();
          this.onSensorDisconnect();
        }
      });

      // set a new reading interval for live calibration readings
      // can be much slower than capture interval.
      this.gdxDevice.start(SENSOR_HEARTBEAT_INTERVAL);

      // turn on any default sensors
      this.gdxDevice.enableDefaultSensors();

      // turn on all sensors that we find on the device
      this.gdxDevice.sensors.forEach(function(sensor: any) {
        sensor.setEnabled(true);
      });

      // get an array of the enabled sensors
      this.enabledSensors = this.gdxDevice.sensors.filter((s: any) => s.enabled);

      if (this.enabledSensors.length == 0) {
        console.log("Could not find any enabled sensors on device");
        return false;
      }

      // read the enabled sensors and construct columns
      let columns: any = {};
      let sets: any = {};
      sets[this.initialColumnNum.toString()] = {
        name: "Run 1",
        colIDs: []
      }
      this.enabledSensors.forEach((sensor: any, index: number) => {
        const cNum = this.initialColumnNum + index;
        let col = {
          id: cNum.toString(),
          setID: cNum.toString(),
          position: (index + 1),
          name: sensor.name,
          units: this.getSensorUnits(sensor),
          liveValue: "NaN",
          liveValueTimeStamp: new Date(),
          valueCount: 0,
          valuesTimeStamp: new Date()
        }
        columns[cNum.toString()] = col;
        sets[this.initialColumnNum.toString()].colIDs.push(cNum);
      });
      this.internalConfig.columns = columns;
      this.internalConfig.sets = sets;

      this.sendSensorConfig(true);

      return true;
    }

    get deviceConnected() {
      if (!this.gdxDevice) {
        return false;
      }
      return true;
    }

    clearConfigLiveValues() {
      this.enabledSensors.forEach((sensor: any, index: number) => {
        const cNum = this.initialColumnNum + index;
        this.internalConfig.columns[cNum].liveValue = "NaN";
      });

      // Resend the sensorconfig so the UI udpates after the disconnection
      this.sendSensorConfig(true);
    }

    async disconnectFromDevice() {
      if (!this.deviceConnected) {
        return;
      }

      this.disconnectRequested = true;

      this.gdxDevice.close();

      this.clearConfigLiveValues();
    }

}

