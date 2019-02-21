import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager, NewSensorData } from "./sensor-manager";
import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import godirect from "@vernier/godirect"

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
            position: 1,
            name: "N/A",
            units: "N/A",
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
      console.log("Reading GDX measurements");

      let startCollectionTime = Date.now();

      const readData = async () => {

        this.enabledSensors.forEach((sensor: any) => {
            const time = Date.now() - startCollectionTime;
            // console.log("Sensor: " + sensor.name + " /  value: " + sensor.value + " /  units: " + sensor.unit);
            //TODO: this needs to handle arbitrary sensor type
            this.updateSensorValue("100", time / 1000, sensor.value);
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
      this.gdxDevice = await godirect.createDevice(device);
      console.log("Created and connected to GDX device " + this.gdxDevice.name);

      this.gdxDevice.enableDefaultSensors();
      this.enabledSensors = this.gdxDevice.sensors.filter((s: any) => s.enabled);
      console.log(this.enabledSensors);
      //read the enabled sensors and construct columns
      this.internalConfig.columns["100"].name = this.enabledSensors[0].name;
      let newUnits = this.enabledSensors[0].unit;
      if (newUnits === "°C") {
        newUnits = "degC";
      }
      this.internalConfig.columns["100"].units = newUnits;
      this.sendSensorConfig(true);
    }

    get deviceConnected() {
      if(!this.gdxDevice) {
        return false;
      }
      // TODO: is there a connection check in the godirect library?
      return true;
    }

    async disconnectFromDevice() {
      if(!this.deviceConnected){
        return;
      }

      this.gdxDevice.close();

      // Resend the sensorconfig so the UI udpates after the disconnection
      this.sendSensorConfig(true);
    }
}

