import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager,
         NewSensorData, ConnectableSensorManager } from "./sensor-manager";
import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import { cloneDeep } from "lodash";

interface ISensorAddrs {
  service: string;
  data: number;
}

const tagAddrs: { [index:string] : ISensorAddrs } = {
  temperatureA: {
    service: 'f000aa00-0451-4000-b000-000000000000',
    data: 0x0001
  },
  temperatureB: {
    service: 'f000bb00-0451-4000-b000-000000000000',
    data: 0x0001
  }
};

const sensorDescriptions = {
  temperatureA: {
    sensorName: "temperatureA",
    values: [
      {
        columnID: "101",
        convertFunct: (byteArray:DataView) => {
          const temp100 = byteArray.getInt32(0, true);
          return temp100/ 100.0;
        }
      }
    ]
  },
  temperatureB: {
    sensorName: "temperatureB",
    values: [
      {
        columnID: "102",
        convertFunct: (byteArray:DataView) => {
          const temp100 = byteArray.getInt32(0, true);
          return temp100/ 100.0;
        }
      }
    ]
  }
};

// Helper function for debugging
function toPaddedHexString(num:number) : string {
    let str = num.toString(16);
    return "0".repeat(2 - str.length) + str;
}

export class ThermoscopeManager extends SensorManager implements ConnectableSensorManager {
    supportsDualCollection = true;

    private sensorConfig: SensorConfiguration;
    private internalConfig: SensorConfig;
    private hasData: boolean = false;
    private stopRequested: boolean = false;
    private device: any;
    private server: any;

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
            name: "Temperature A",
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
            name: "Temperature B",
            units: "degC",
            liveValue: "NaN",
            liveValueTimeStamp: new Date(),
            valueCount: 0,
            valuesTimeStamp: new Date()
          }
        },
        currentInterface: "Thermoscope",
        currentState: "unknown",
        os: { name: "Fake", version: "1.0.0"},
        requestTimeStamp: new Date(),
        server: { arch: "Fake", version: "1.0.0" },
        sessionDesc: "Fake",
        sessionID: "1234",
        sets:{
          "100": {
            name: "Run 1",
            // colIDs: [100, 102, 103]
            // colIDs: [100, 101]
            colIDs: [100, 101, 102]
          }
        }
      };
      this.sensorConfig = new SensorConfiguration(this.internalConfig);
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
        // resend the sensorConfig so we will know if the device is disconnected
        // This could be smarter if it keeps track of which sensors have been
        // enabled on the device
        this.sendSensorConfig(false);
      }, 1000);
    }

    hasSensorData() {
      return this.hasData;
    }

    requestStart() {
      // cloneDeep is used because we are saving the dataCharacteristic on this object
      // and that will change after the device is disconnected and reconnected

      // const activeSensors = [  cloneDeep(sensorDescriptions.IRTemperature) ];
      // const activeSensors = [ cloneDeep(sensorDescriptions.luxometer) ];
      const activeSensors = [
        cloneDeep(sensorDescriptions.temperatureA),
        cloneDeep(sensorDescriptions.temperatureB)
      ];

      // For each one get its valueCharacteristic
      activeSensors.forEach((sensor) => {
        this.setupSensor(sensor);
      });

      let startCollectionTime = Date.now();

      const readData = async () => {
        // use one time for all readings so when doing a multi sensor export
        // the readings match up
        const time = Date.now() - startCollectionTime;

        // collect all of the promises
        const readSensorPromises = activeSensors.map((sensor) => {
          return this.readSensor(time, sensor);
        });

        // wait for all active sensors to be read
        await Promise.all(readSensorPromises);

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

    printByteArray(byteArray:DataView) {
      let hex:string = "";
      for(let i=0; i < byteArray.byteLength; i++) {
        hex += toPaddedHexString(byteArray.getUint8(i));
      }
      console.log(`read bytes: ${hex}`);
    }

    async readSensor(time:number, sensor:any) {
      if(!sensor.dataCharacteristic) {
        // The dataCharacteristic hasn't been setup yet
        return;
      }

      // Read bytes
      const byteArray = await sensor.dataCharacteristic.readValue();
      this.printByteArray(byteArray);

      sensor.values.forEach((valueDesc:any) => {
        // Step 8: convert value and notify listeners
        // This would be better if the SensorManager interface supported
        // the ability to send multiple values for a single time value
        this.updateSensorValue(valueDesc.columnID, time / 1000,
          valueDesc.convertFunct(byteArray));
      });
    }

    requestStop() {
      this.stopRequested = true;
    }

    async connectToDevice() {
      // ask for a device
      this.device = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix:  "Thermoscope" }],
          optionalServices: [tagAddrs.temperatureA.service,
                             tagAddrs.temperatureB.service]
        });
      // Connect to device
      this.server = await this.device.gatt.connect();

      // Resend the sensorconfig so the UI udpates after the connection
      this.sendSensorConfig(true);
    }

    get deviceConnected() {
      if(!this.device) {
        return false;
      }
      return this.device.gatt.connected;
    }

    async disconnectFromDevice() {
      if(!this.deviceConnected){
        return;
      }

      await this.device.gatt.disconnect();

      // Resend the sensorconfig so the UI udpates after the disconnection
      this.sendSensorConfig(true);
    }

    updateSensorValue(ID:string, time:number, value:number) {
      this.internalConfig.columns[ID].liveValue = value.toString();
      this.hasData = true;

      this.onSensorStatus(new SensorConfiguration(this.internalConfig));
      const data:NewSensorData = {};
      data[ID] = [[time, value]];
      this.onSensorData(data);
    }

    async setupSensor(sensorDescription:any) {
      const sensorAddrs = tagAddrs[sensorDescription.sensorName];

      // Get the Service
      const service = await this.server.getPrimaryService(sensorAddrs.service);

      // Get and save data characteristic
      sensorDescription.dataCharacteristic =
        await service.getCharacteristic(sensorAddrs.data);
    }
}
