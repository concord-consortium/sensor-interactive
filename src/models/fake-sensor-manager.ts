import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager } from "./sensor-manager";
import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import { cloneDeep } from "lodash";

export class FakeSensorManager extends SensorManager {
    supportsDualCollection = true;

    // private sensorConfig: SensorConfiguration;
    private internalConfig: SensorConfig;
    private hasData: boolean = false;
    private interval: any;
    private singleReads: boolean;

    constructor(options?: {singleReads?: boolean}) {
      super();
      this.singleReads = !!options?.singleReads;

      // create fake SensorConfiguration
      // This should be improved, we don't need all of these properties when making
      // a new sensor manager. The SensorConfiguration class could be have an
      // interface so then sensor managers can provide their own implementation
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
            name: "Temperature",
            units: "degC",
            liveValue: "NaN",
            liveValueTimeStamp: new Date(),
            valueCount: 0,
            valuesTimeStamp: new Date()
          },
          "102": {
            id: "102",
            setID: "100",
            position: 2,
            name: "Position",
            units: "m",
            liveValue: "NaN",
            liveValueTimeStamp: new Date(),
            valueCount: 0,
            valuesTimeStamp: new Date()
          }
        },
        currentInterface: "Fake Sensor",
        currentState: "unknown",
        os: { name: "Fake", version: "1.0.0"},
        requestTimeStamp: new Date(),
        server: { arch: "Fake", version: "1.0.0" },
        sessionDesc: "Fake",
        sessionID: "1234",
        sets:{
          "100": {
            name: "Run 1",
            colIDs: [100, 101, 102]
          }
        }
      };
      // this.sensorConfig = new SensorConfiguration(this.internalConfig);

      this.supportsHeartbeat = true;
    }

    cloneInternalConfig() {
      return cloneDeep(this.internalConfig);
    }

    isWirelessDevice() {
      return false;
    }

    startPolling() {
      setTimeout(() => {
        let sensorConfig = new SensorConfiguration(this.cloneInternalConfig());
        this.onSensorConnect(sensorConfig);
        this.onSensorStatus(sensorConfig);
      }, 100);
    }

    hasSensorData() {
      return this.hasData;
    }

    requestStart(measurementPeriod: number) {
      if (this.singleReads) {
        const temperatureValue = 17 + (Math.random() * 5),
              positionValue = 1 - (Math.random() * 2);
        this.sendValues(0, {temperatureValue, positionValue});
      }
      else {
        let start: number|undefined = undefined;
        const generateValue = () => {
          const now = Date.now()
          start = start || now
          const time = (now - start)/1000;
          const temperatureValue = Math.sin((Math.PI/3)*time)*3 + 20,
                positionValue = Math.sin((Math.PI/3)*time);
          this.sendValues(time, {temperatureValue, positionValue});
        }
        generateValue();
        this.interval = setInterval(() => {
          generateValue()
        }, measurementPeriod || 100);
      }
    }

    requestStop() {
      clearTimeout(this.interval);
      setTimeout(() => {
        this.onSensorCollectionStopped();
      });
    }

    requestHeartbeat(enabled: boolean): void {
        this.manageHeartbeat(enabled, () => {
          const temperatureValue = 17 + (Math.random() * 5);
          const positionValue = 1 - (Math.random() * 2);
          const config = this.cloneInternalConfig();

          config.columns["101"].liveValue = temperatureValue.toString();
          config.columns["102"].liveValue = positionValue.toString();

          this.onSensorHeartbeat(new SensorConfiguration(config));
        });
    }

    variableMeasurementPeriods() {
      return {
        supported: true,
        periods: [1000, 500, 200, 100, 50, 10],
        defaultPeriod: 50
      }
    }

    private sendValues(time: number, {temperatureValue, positionValue}: {temperatureValue: number, positionValue: number}) {
      this.internalConfig.columns["101"].liveValue = temperatureValue.toString();
      this.internalConfig.columns["102"].liveValue = positionValue.toString();
      this.hasData = true;

      this.onSensorStatus(new SensorConfiguration(this.cloneInternalConfig()));
      this.onSensorData({ "101": [[time, temperatureValue]]});
      this.onSensorData({ "102": [[time, positionValue]]});
    }
}
