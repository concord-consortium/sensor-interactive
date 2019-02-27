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
    private disconnectRequested: boolean = false;
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
        this.sendSensorConfig(true);
      }, 10);
      setInterval(() => {
        //TODO: do we need to cancel while collecting or while disconnected
        this.pollSensor();
      }, 1000);

    }

    pollSensor() {
      const readLiveData = async () => {
        let colNum = 100;
        if (!this.disconnectRequested) {
          this.enabledSensors.forEach((sensor: any, index: number) => {
              const cNum = colNum + index;
              this.internalConfig.columns[cNum].liveValue = sensor.value.toString();
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
      console.log("Reading GDX measurements");

      let startCollectionTime = Date.now();

      const readData = async () => {
        let colNum = 100;
        this.enabledSensors.forEach((sensor: any, index: number) => {
            const cNum = colNum + index;
            const time = Date.now() - startCollectionTime;
            // console.log("Sensor: " + sensor.name + " /  value: " + sensor.value + " /  units: " + sensor.unit);
            this.updateSensorValue(cNum.toString(), time / 1000, sensor.value);
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

    async getBatteryLevel() {
      const batteryLevel = await this.gdxDevice.getBatteryLevel();
      console.log("Battery Level: " + batteryLevel);
      return batteryLevel;
    }

    async connectToDevice(device?: any) {
      this.gdxDevice = await godirect.createDevice(device);

      if(!this.gdxDevice) {
        console.log("Could not create GDX device");
        return false;
      }

      console.log("Created and connected to GDX device " + this.gdxDevice.name);
      console.log(this.gdxDevice);

      // turn on any default sensors
      this.gdxDevice.enableDefaultSensors();

      // turn on all sensors that we find on the device
      this.gdxDevice.sensors.forEach(function(sensor: any){
        sensor.setEnabled(true);
      });

      // get an array of the enabled sensors
      this.enabledSensors = this.gdxDevice.sensors.filter((s: any) => s.enabled);

      if(this.enabledSensors.length == 0) {
        console.log("Could not find any enabled sensors on device");
        return false;
      }

      this.enabledSensors.forEach((sensor: any) => {
        console.log("Sensor: " + sensor.name + " /  value: " + sensor.value + " /  units: " + sensor.unit);
      });

      //read the enabled sensors and construct columns
      let colNum = 100;
      let columns: any = {};
      let sets: any = {};
      sets[colNum.toString()] = {
        name: "Run 1",
        colIDs: []
      }
      this.enabledSensors.forEach((sensor: any, index: number) => {
        const cNum = colNum + index;
        //TODO: need to convert their units to our units
        let newUnits = sensor.unit; //this.convertUnits(sensor.unit);
        let col = {
          id: cNum.toString(),
          setID: cNum.toString(),
          position: (index + 1),
          name: sensor.name,
          units: newUnits,
          liveValue: "NaN",
          liveValueTimeStamp: new Date(),
          valueCount: 0,
          valuesTimeStamp: new Date()
        }
        columns[cNum.toString()] = col;
        sets[colNum.toString()].colIDs.push(cNum);
      });
      this.internalConfig.columns = columns;
      this.internalConfig.sets = sets;

      this.sendSensorConfig(true);

      return true;
    }

    convertUnits(units: string) {
      let newUnits = units;
      if (newUnits === "°C") {
        newUnits = "degC";
      }
      return newUnits;
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

      this.disconnectRequested = true;

      this.gdxDevice.close();

      // Resend the sensorconfig so the UI udpates after the disconnection
      this.sendSensorConfig(true);
    }
}

