import { SensorConfiguration } from "./sensor-configuration";
import { ISensorManager, SensorManagerListeners } from "./sensor-manager";
import { ISensorConfig } from "./sensor-connector-interface";

const tagIdentifier = 0xaa80;
const tagAddrs = {
  luxometer: {
    service: 'f000aa70-0451-4000-b000-000000000000',
    value: 'f000aa71-0451-4000-b000-000000000000',
    enable: 'f000aa72-0451-4000-b000-000000000000'
  },
  IO: {
    service: 'f000aa64-0451-4000-b000-000000000000',
    data: 'f000aa65-0451-4000-b000-000000000000',
    config: 'f000aa66-0451-4000-b000-000000000000'
  }
};

export class SensorTagManager implements ISensorManager {
    listeners:SensorManagerListeners = {};

    private sensorConfig: SensorConfiguration;
    private internalConfig: ISensorConfig;
    private hasData: boolean = false;
    private stopRequested: boolean = false;
    private device: any;
    private server: any;

    constructor() {
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
            colIDs: [100, 101]
          }
        }
      };
      this.sensorConfig = new SensorConfiguration(this.internalConfig);
    }

    sendSensorConfig(includeOnConnect:boolean) {
      let sensorConfig = new SensorConfiguration(this.internalConfig);
      if(includeOnConnect && this.listeners.onSensorConnect) {
          this.listeners.onSensorConnect(sensorConfig);
      }
      if(this.listeners.onSensorStatus) {
          this.listeners.onSensorStatus(sensorConfig);
      }
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

    sensorHasData() {
      return this.hasData;
    }

    requestStart() {
      this.startLight();
      // let time = 0.0;
      // this.interval = setInterval(() => {
      //   const temperatureValue = Math.sin((Math.PI/3)*time)*3 + 20,
      //       positionValue = Math.sin((Math.PI/3)*time);
      //
      //   this.internalConfig.columns["101"].liveValue = temperatureValue.toString();
      //   this.internalConfig.columns["102"].liveValue = positionValue.toString();
      //   this.hasData = true;
      //
      //   if(this.listeners.onSensorStatus) {
      //       this.listeners.onSensorStatus(new SensorConfiguration(this.internalConfig));
      //   }
      //   if(this.listeners.onSensorData) {
      //       this.listeners.onSensorData({ "101": [[time, temperatureValue]]});
      //       this.listeners.onSensorData({ "102": [[time, positionValue]]});
      //   }
      //   time += 0.1;
      // }, 100);
    }

    requestStop() {
      this.stopRequested = true;
    }

    async connectToDevice() {
      // Step 1: ask for a device
      this.device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [tagIdentifier] }],
          optionalServices: [tagAddrs.luxometer.service,
                             tagAddrs.IO.service]
        });
      // Step 2: Connect to device
      this.server = await this.device.gatt.connect();

      // Resend the sensorconfig so the UI udpates after the connection
      this.sendSensorConfig(true);

      // Make the green led go solid so we know we are connected
      this.turnOnGreenLED();
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
        return false
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

    async startLight() {
      // Step 3: Get the Service
      const service =
        await this.server.getPrimaryService(tagAddrs.luxometer.service);

      // Step 4: Enable Light Sensor
      const enableChar =
        await service.getCharacteristic(tagAddrs.luxometer.enable);
      await enableChar.writeValue(new Uint8Array([0x01]));

      // Step 5: Get light characteristic
      const valueChar = await service.getCharacteristic(tagAddrs.luxometer.value);

      // Step 6: Loop every 500ms
      let startCollectionTime = Date.now();
      const readLight = async () => {
        // Step 7: Read bytes
        const byteArray = await valueChar.readValue();

        const time = Date.now() - startCollectionTime;

        // Step 8: display light
        this.updateLight(time / 1000, byteArray.getUint16(0, true));

        if(!this.stopRequested) {
          setTimeout(readLight, 10);
        } else {
          if(this.listeners.onSensorCollectionStopped) {
              this.listeners.onSensorCollectionStopped();
          }
          this.stopRequested = false;
        }
      }

      readLight();
    }

    updateLight(time: number, lightValue: number) {
      this.internalConfig.columns["101"].liveValue = lightValue.toString();
      this.hasData = true;

      if(this.listeners.onSensorStatus) {
          this.listeners.onSensorStatus(new SensorConfiguration(this.internalConfig));
      }
      if(this.listeners.onSensorData) {
          this.listeners.onSensorData({ "101": [[time, lightValue]]});
      }
    }
}
