import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager, NewSensorData, HEARTBEAT_INTERVAL_MS } from "./sensor-manager";
import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import { IStringMap } from "./sensor-definitions";
import godirect from "@vernier/godirect"
import { cloneDeep } from "lodash";

const goDirectServiceUUID = "d91714ef-28b9-4f91-ba16-f0d9a604f112";
const goDirectDevicePrefix = "GDX";

const POLLING_INTERVAL = 1000;
const MIN_EKG_INTERVAL_MS = 1000;

type OnChangeSensorChangeData = {
  time: number,
  index: number,
  delta: number,
  stopping: boolean
};

export const SpecialMeasurementUnits: IStringMap = {
  "Wind Speed": "m/s_WS",
  "Wind Direction": "°_WD",
  "Wind Chill": "°C_WC",
  "Heat Index": "°C_HI",
  "Dew Point": "°C_DP",
  "Relative Humidity": "%RH",
  "Station Pressure": "mbar_SP",
  "Barometric Pressure": "mbar_BP",
  "Altitude": "m_AL",
  "EKG": "mV_EKG"
}

export class SensorGDXManager extends SensorManager {
    supportsDualCollection = true;

    private internalConfig: SensorConfig;
    private hasData: boolean = false;
    private stopRequested: boolean = false;
    private disconnectRequested: boolean = false;
    private bluetoothDevice: BluetoothDevice|undefined;
    private gdxDevice: any;
    private enabledSensors: any;
    private initialColumnNum = 100;

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

    // This value gets sent to gdxDevice.start() to set the measurement period.
    // It gets used when we've actually started the sensor data graphing.
    getMeasurementPeriod() {
      // The Heart Rate sensor is only able to collect 1 sample per second.
      if (this.gdxDevice.orderCode === "GDX-EKG") {
        return MIN_EKG_INTERVAL_MS;
      } else {
        return this.gdxDevice.minMeasurementPeriod;
      }
    }

    // This value also gets sent to gdxDevice.start() to set the measurement period.
    // It gets used when we're displaying the calibration values, not during collecting / graphing.
    getHeartbeatInterval() {
      if (this.gdxDevice.orderCode === "GDX-EKG") {
        return MIN_EKG_INTERVAL_MS;
      } else {
        // We  need to sample at twice heartbeat rate.
        // This is the nyquist frequency, and insures we have at least one sample for
        // each heartbeat.
        return HEARTBEAT_INTERVAL_MS / 2;
      }
    }

    onChangeSensorChange = (sensor: any) => {
      const {index, delta, time, stopping} = sensor.onChangeSensorChangeData as OnChangeSensorChangeData;
      const cNum = this.initialColumnNum + index;
      this.updateSensorValue(cNum.toString(), time, sensor.value);
      sensor.onChangeSensorChangeData.time += delta;

      if (this.stopRequested && !stopping) {
        this.stopRequested = false;
        // sensor.onChangeSensorChangeData.stopping = true;

        this.enabledSensors.forEach((sensor: any, index: number) => {
          sensor.off("value-changed", this.onChangeSensorChange);
        });

        this.gdxDevice.stop();
        this.onSensorCollectionStopped();
      }
    }

    requestStart(measurementPeriod: number) {
      measurementPeriod = measurementPeriod || this.getMeasurementPeriod();

      this.gdxDevice.stop();

      this.enabledSensors.forEach((sensor: any, index: number) => {
        const onChangeSensorChangeData: OnChangeSensorChangeData = {
          time: 0,
          delta: measurementPeriod / 1000,
          index,
          stopping: false
        }
        sensor.onChangeSensorChangeData = onChangeSensorChangeData;
        sensor.on("value-changed", this.onChangeSensorChange);
      });

      this.gdxDevice.start(measurementPeriod);
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
          const heartbeatInterval = this.getHeartbeatInterval();
          this.gdxDevice.start(heartbeatInterval);
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

    async connectToDevice(bluetoothDevice?: BluetoothDevice): Promise<boolean> {
      this.disconnectRequested = false;

      this.bluetoothDevice = bluetoothDevice;
      this.gdxDevice = await godirect.createDevice(bluetoothDevice, { open: true, startMeasurements: false });

      if (!this.gdxDevice) {
        this.disconnectRequested = true;
        this.disconnectBluetoothDevice();
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
      const heartbeatInterval = this.getHeartbeatInterval();
      this.gdxDevice.start(heartbeatInterval);
      // turn on any default sensors
      this.gdxDevice.enableDefaultSensors();

      const gdxDevice = this.gdxDevice;
      // turn on all sensors that we find on the device
      this.gdxDevice.sensors.forEach(function(sensor: any) {
        // Check if we are using the EKG sensor.
        // PI's are not interested in EMG/Voltage data, and enabling those sensors
        // disables the Heart Rate sensor, so we will only enable Heart Rate.
        if (gdxDevice.orderCode === "GDX-EKG") {
          if (sensor.name === "Heart Rate") {
            sensor.setEnabled(true);
            return;
          } else {
            sensor.setEnabled(false);
          }
        } else {
          sensor.setEnabled(true);
        }
      });

      // get an array of the enabled sensors
      this.enabledSensors = this.gdxDevice.sensors.filter((s: any) => s.enabled);

      if (this.enabledSensors.length === 0) {
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

      // Resend the sensorconfig so the UI updates after the disconnection
      this.sendSensorConfig(true);
    }

    async disconnectFromDevice() {
      if (!this.deviceConnected) {
        return;
      }

      this.disconnectRequested = true;

      this.gdxDevice.close();
      this.gdxDevice = null;

      this.disconnectBluetoothDevice();

      this.clearConfigLiveValues();
    }

    disconnectBluetoothDevice() {
      if (this.bluetoothDevice) {
        if (this.bluetoothDevice.gatt?.connected) {
          this.bluetoothDevice.gatt.disconnect();
        }
        this.bluetoothDevice = undefined;
      }
    }

    variableMeasurementPeriods() {
      if (!this.gdxDevice) {
        return {
          supported: false,
          periods: [],
          defaultPeriod: 0
        }
      }

      const deviceMinPeriod = this.getMeasurementPeriod();
      const sensorMinPeriod = this.gdxDevice.sensors?.[0]?.specs?.measurementInfo?.minPeriod ?? 10;
      const defaultPeriod = Math.max(deviceMinPeriod, sensorMinPeriod);
      const periods: number[] = [... new Set([
        1,
        10,
        50,
        100,
        200,
        500,
        1000,
        defaultPeriod,
        deviceMinPeriod,
        sensorMinPeriod
      ].filter(n => n >= defaultPeriod))]
      periods.sort((a, b) => b - a)

      return {
        supported: true,
        periods,
        defaultPeriod
      }
    }
}
