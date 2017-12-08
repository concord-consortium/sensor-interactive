import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager } from "./sensor-manager";
import { ISensorConfig } from "./sensor-connector-interface";

export class FakeSensorManager extends SensorManager {
    supportsDualCollection = true;
    
    private sensorConfig: SensorConfiguration;
    private internalConfig: ISensorConfig;
    private hasData: boolean = false;
    private interval: any;

    constructor() {
      super();
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
      this.sensorConfig = new SensorConfiguration(this.internalConfig);
    }

    startPolling() {
      setTimeout(() => {
        let sensorConfig = new SensorConfiguration(this.internalConfig);
        this.onSensorConnect(sensorConfig);
        this.onSensorStatus(sensorConfig);
      }, 100);
    }

    hasSensorData() {
      return this.hasData;
    }

    requestStart() {
      let time = 0.0;
      this.interval = setInterval(() => {
        const temperatureValue = Math.sin((Math.PI/3)*time)*3 + 20,
            positionValue = Math.sin((Math.PI/3)*time);

        this.internalConfig.columns["101"].liveValue = temperatureValue.toString();
        this.internalConfig.columns["102"].liveValue = positionValue.toString();
        this.hasData = true;

        this.onSensorStatus(new SensorConfiguration(this.internalConfig));
        this.onSensorData({ "101": [[time, temperatureValue]]});
        this.onSensorData({ "102": [[time, positionValue]]});

        time += 0.1;
      }, 100);
    }

    requestStop() {
      clearTimeout(this.interval);
      setTimeout(() => {
        this.onSensorCollectionStopped();
      });
    }
}
