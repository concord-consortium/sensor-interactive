import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager, NewSensorData } from "./sensor-manager";
import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import { cloneDeep } from "lodash";
import godirect from "@vernier/godirect"


const sensorDescriptions = {
  temperature: {
    sensorName: "temperature",
    values: [
      {
        columnID: "101"
      }
    ]
  }
};

export class SensorGDXManager extends SensorManager {
    supportsDualCollection = true;

    // private sensorConfig: SensorConfiguration;
    private internalConfig: SensorConfig;
    private hasData: boolean = false;
    private stopRequested: boolean = false;
    private gdxDevice: any;
    private enabledSensors: any;

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
          }
        },
        currentInterface: "GDX Sensor",
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
    }

    sendSensorConfig(includeOnConnect:boolean) {
      let sensorConfig = new SensorConfiguration(this.internalConfig);
      if(includeOnConnect) {
        this.onSensorConnect(sensorConfig);
      }
      this.onSensorStatus(sensorConfig);
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
      // cloneDeep is used because we are saving the dataCharacteristic on this object
      // and that will change after the device is disconnected and reconnected

      const activeSensors = [ cloneDeep(sensorDescriptions.temperature) ];
      console.log(activeSensors);

      console.log("Reading GDX measurements");

      this.gdxDevice.on('device-closed', () => {
          console.log("Disconnected from GDX device " + this.gdxDevice.name);
      });

      let startCollectionTime = Date.now();

      const readData = async () => {

        this.enabledSensors.forEach((sensor: any) => {
            // log the sensor name, new value and units.
            const time = Date.now() - startCollectionTime;
            // console.log("Sensor: " + sensor.name + " /  value: " + sensor.value + " /  units: " + sensor.unit);
            this.updateSensorValue("101", time / 1000, sensor.value);
        });

        if(!this.stopRequested) {
          // Repeat
          setTimeout(readData, 10);
        } else {
          this.onSensorCollectionStopped();
          this.stopRequested = false;
        }
      };

      readData();

    }

    updateSensorValue(ID:string, time:number, value:number) {
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

    async connectToDevice(device?: any) {
      console.log("create gdxDevice")
      this.gdxDevice = await godirect.createDevice(device);

      console.log(this.gdxDevice);
      console.log("Connected to GDX device " + this.gdxDevice.name);

      this.gdxDevice.enableDefaultSensors();
      this.enabledSensors = this.gdxDevice.sensors.filter((s: any) => s.enabled);
/*
      console.log("Reading GDX measurement ");

      this.gdxDevice.on('device-closed', () => {
          console.log("Disconnected from GDX device " + this.gdxDevice.name);
      });


      enabledSensors.forEach((sensor: any) => {
          sensor.on("value-changed", (sensor: any) => {
            // Only collect 10 samples and disconnect.
            if (sensor.values.length > 10){
              this.gdxDevice.close();
            }
            // log the sensor name, new value and units.
            console.log("Sensor: " + sensor.name + " /  value: " + sensor.value + " /  units: " + sensor.unit);
          });
      });
      */
    }

}
