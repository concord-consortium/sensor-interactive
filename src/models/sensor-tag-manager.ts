import { SensorConfiguration } from "./sensor-configuration";
import { SensorManager,
         NewSensorData, ConnectableSensorManager } from "./sensor-manager";
import { SensorConfig } from "@concord-consortium/sensor-connector-interface";
import { cloneDeep } from "lodash";

const tagIdentifier = 0xaa80;
interface ISensorAddrs {
  service: string;
  data: string;
  config: string;
}

const tagAddrs: { [index:string] : ISensorAddrs } = {
  luxometer: {
    service: 'f000aa70-0451-4000-b000-000000000000',
    data: 'f000aa71-0451-4000-b000-000000000000',
    config: 'f000aa72-0451-4000-b000-000000000000'
  },
  humidity: {
    service: 'f000aa20-0451-4000-b000-000000000000',
    data: 'f000aa21-0451-4000-b000-000000000000', // TempLSB:TempMSB:HumidityLSB:HumidityMSB
    config: 'f000aa22-0451-4000-b000-000000000000'
  },
  IRTemperature: {
    service: 'f000aa00-0451-4000-b000-000000000000',
    data: 'f000aa01-0451-4000-b000-000000000000', // ObjectLSB:ObjectMSB:AmbientLSB:AmbientMSB
    config: 'f000aa02-0451-4000-b000-000000000000'
  },
  IO: {
    service: 'f000aa64-0451-4000-b000-000000000000',
    data: 'f000aa65-0451-4000-b000-000000000000',
    config: 'f000aa66-0451-4000-b000-000000000000'
  }
};

// http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User%27s_Guide
const IR_SCALE_LSB = 0.03125;

// tslint:disable:no-bitwise

const sensorDescriptions = {
  luxometer: {
    sensorName: "luxometer",
    values: [
      {
        columnID: "101",
        convertFunct: (byteArray:DataView) => {
          const rawData = byteArray.getUint16(0, true),
            m = rawData & 0x0FFF;
          let e = (rawData & 0xF000) >> 12;

          /** e on 4 bits stored in a 16 bit unsigned => it can store 2 << (e - 1) with e < 16 */
          e = (e === 0) ? 1 : 2 << (e - 1);

          return m * (0.01 * e);
        }
      }
    ]
  },
  IRTemperature: {
    sensorName: "IRTemperature",
    values: [
      {
        columnID: "102", // ambient
        convertFunct: (byteArray: DataView) => {
          const rawTemp = byteArray.getUint16(2, true);
          return (rawTemp >> 2) * IR_SCALE_LSB;
        }
      },
      {
        columnID: "103", // object temperature
        convertFunct: (byteArray: DataView) => {
          const rawTemp = byteArray.getUint16(0, true);
          return (rawTemp >> 2) * IR_SCALE_LSB;
        }
      }
    ]
  },
  humidity: {
    sensorName: "humidity",
    values: [
      {
        columnID: "104", // humidity
        convertFunct: (byteArray: DataView) => {
          let rawHum = byteArray.getUint16(2, true);
          rawHum &= ~0x0003; // remove status bits
          return (rawHum / 65536)*100;
        }
      },
      {
        columnID: "105", // ambient temperature
        convertFunct: (byteArray: DataView) => {
          const rawTemp = byteArray.getInt16(0, true);
          return (rawTemp / 65536)*165 - 40;
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

export class SensorTagManager extends SensorManager implements ConnectableSensorManager {
    supportsDualCollection = false;

    // private sensorConfig: SensorConfiguration;
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
            name: "Light",
            units: "lux",
            liveValue: "NaN",
            liveValueTimeStamp: new Date(),
            valueCount: 0,
            valuesTimeStamp: new Date()
          },
          "102": {
            id: "102",
            setID: "100",
            position: 1,
            name: "Temperature",
            units: "degC",
            liveValue: "NaN",
            liveValueTimeStamp: new Date(),
            valueCount: 0,
            valuesTimeStamp: new Date()
          },
          "103": {
            id: "103",
            setID: "100",
            position: 1,
            name: "IR Temperature",
            units: "degC",
            liveValue: "NaN",
            liveValueTimeStamp: new Date(),
            valueCount: 0,
            valuesTimeStamp: new Date()
          },
          "104": {
            id: "104",
            setID: "100",
            position: 1,
            name: "Humidity",
            units: "%RH",
            liveValue: "NaN",
            liveValueTimeStamp: new Date(),
            valueCount: 0,
            valuesTimeStamp: new Date()
          },
          "105": {
            id: "105",
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
        currentInterface: "SensorTag",
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
            colIDs: [100, 104, 105]
          }
        }
      };
      // this.sensorConfig = new SensorConfiguration(this.internalConfig);
    }

    static getOptionalServices() {
      return [tagAddrs.luxometer.service,
              tagAddrs.humidity.service,
              tagAddrs.IRTemperature.service,
              tagAddrs.IO.service];
    }

    static getWirelessFilters() {
      return [
        // This is a filter for the CC2650
        { services: [tagIdentifier] },
        // This is a filter for the LPSTK
        { services: ['f0001110-0451-4000-b000-000000000000']}];
    }

    sendSensorConfig(includeOnConnect:boolean) {
      let sensorConfig = new SensorConfiguration(this.internalConfig);
      if(includeOnConnect) {
        this.onSensorConnect(sensorConfig);
      }
      this.onSensorStatus(sensorConfig);
    }

    isWirelessDevice() {
      return true;
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
      const activeSensors = [ cloneDeep(sensorDescriptions.humidity) ];

      // For each one get its valueCharacteristic
      activeSensors.forEach((sensor) => {
        this.setupSensor(sensor);
      });

      let startCollectionTime = Date.now();

      const readData = async () => {
        // collect all of the promises
        const readSensorPromises = activeSensors.map((sensor) => {
          return this.readSensor(startCollectionTime, sensor);
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

    async readSensor(startCollectionTime:number, sensor:any) {
      if(!sensor.dataCharacteristic) {
        // The dataCharacteristic hasn't been setup yet
        return;
      }

      // Step 7: Read bytes
      const byteArray = await sensor.dataCharacteristic.readValue();
      this.printByteArray(byteArray);

      const time = Date.now() - startCollectionTime;

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

    async connectToDevice(device?: any): Promise<boolean> {
      if (device) {
        this.device = device;
      } else {
        // Step 1: ask for a device
        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [tagIdentifier] }],
          optionalServices: [tagAddrs.luxometer.service,
                             tagAddrs.humidity.service,
                             tagAddrs.IRTemperature.service,
                             tagAddrs.IO.service]
        });
      }
      // Step 2: Connect to device
      this.server = await this.device.gatt.connect();

      // Resend the sensorconfig so the UI udpates after the connection
      this.sendSensorConfig(true);

      // Make the green led go solid so we know we are connected
      // FIXME: this service is different on LPSTK sensor tag
      // The app provided by TI seems to turn the green LED of the LPSTK on
      // upon connection, but this doesn't seem to happen by default. So it
      // probably makes sense that we continue to do this for both the
      // CC2650 and the LPSTK sensor tags
      this.turnOnGreenLED();

      return true;
    }

    async turnOnGreenLED() {
      if(!this.server) {
        return;
      }

      // Get the IO service
      const service =
        await this.server.getPrimaryService(tagAddrs.IO.service);

      // The order is important, by default the data value is 0x7F which
      // is enables flashing lights and beep. Not fun!
      // So we set the data first before turning on remote control

      // Set data so the green led will turn on when remote control is set
      const dataChar =
        await service.getCharacteristic(tagAddrs.IO.data);
      await dataChar.writeValue(new Uint8Array([0x02]));

      // Enable Remote IO control
      const configChar =
        await service.getCharacteristic(tagAddrs.IO.config);
      await configChar.writeValue(new Uint8Array([0x01]));
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

      // Step 3: Get the Service
      const service = await this.server.getPrimaryService(sensorAddrs.service);

      // Step 4: Enable Sensor
      const configChar = await service.getCharacteristic(sensorAddrs.config);
      await configChar.writeValue(new Uint8Array([0x01]));

      // Step 5: Get and save data characteristic
      sensorDescription.dataCharacteristic =
        await service.getCharacteristic(sensorAddrs.data);
    }
}
