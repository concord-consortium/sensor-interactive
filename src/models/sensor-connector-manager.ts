//import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";
// must use the following form when using npm link to develop/debug locally
import * as SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";
import { SensorConfiguration } from "./sensor-configuration";
import { SensorConfigColumnInfo, SensorConnectorDataset } from "@concord-consortium/sensor-connector-interface";
import { SensorManager, NewSensorData } from "./sensor-manager";

const SENSOR_IP = "http://127.0.0.1:11180";
const DELAY_AFTER_WAKE = 1000;

interface ColumnInfo {
  lastDataIndex: number;
}

export class SensorConnectorManager extends SensorManager {
    supportsDualCollection = true;

    private sensorConnector:SensorConnectorInterface;
    private columnInfoById:{ [key:string]: ColumnInfo } = {};
    private sensorConfig: SensorConfiguration;

    constructor() {
      super();
      this.sensorConnector = new SensorConnectorInterface();

      this.sensorConnector.on("interfaceConnected", this.handleSensorConnect);
      this.sensorConnector.on("interfaceRemoved", this.handleSensorConnect);
      this.sensorConnector.on("columnAdded", this.handleSensorConnect);
      this.sensorConnector.on("columnMoved", this.handleSensorConnect);
      this.sensorConnector.on("columnRemoved", this.handleSensorConnect);
      this.sensorConnector.on("datasetAdded", this.handleSensorConnect);

      this.sensorConnector.on("data", this.handleSensorData);

      this.sensorConnector.on("collectionStopped", this.handleSensorCollectionStopped);

      this.sensorConnector.on("statusReceived", this.handleSensorStatus);

      this.sensorConnector.on("statusErrored", this.handleCommunicationError);
      this.sensorConnector.on("launchTimedOut", this.handleCommunicationError);
    }

    isWirelessDevice() {
      return false;
    }

    startPolling() {
      // triggers initial connection to SensorConnector application
      this.sensorConnector.startPolling(SENSOR_IP);

      // Try to stop it from collecting in case it was left in a collecting state
      this.sensorConnector.requestStop();
    }

    removeListeners() {
      this.sensorConnector.off();
    }

    hasSensorData() {
      const dataSet = this.sensorConnector.datasets[0];
      return !!(dataSet && dataSet.columns[1]);
    }

    requestStart() {
      if (this.requestWake()) {
        this.sensorConnector.requestStart();
      }
      else {
        setTimeout(() => this.sensorConnector.requestStart(), DELAY_AFTER_WAKE);
      }
    }

    requestStop() {
      this.sensorConnector.requestStop();
    }

    requestHeartbeat(enabled: boolean): void {
        // FIXME: add heartbeat support when a device to test is available
        console.error("Heartbeat not currently supported for this sensor");
    }

    isAwake() {
      return this.sensorConnector.isConnected;
    }

    requestSleep() {
      this.sensorConnector.requestExit();
    }

    requestWake(): boolean {
      return this.sensorConnector.requestLaunch();
    }

    handleCommunicationError = () => {
      this.onCommunicationError();
    }

    handleSensorConnect = () => {
        const statusReceived = this.sensorConnector.currentActionArgs,
            config = statusReceived[1];

        this.sensorConfig = new SensorConfiguration(config);

        this.onSensorConnect(this.sensorConfig);
    }

    handleSensorCollectionStopped = () => {
        this.onSensorCollectionStopped();
    }

    handleSensorStatus = () => {
        const statusReceived = this.sensorConnector.currentActionArgs,
            config = statusReceived[1];
        this.sensorConfig = new SensorConfiguration(config);
        this.onSensorStatus(this.sensorConfig);
    }

    // this is the id of the column that has new data
    handleSensorData = (columnId:string) => {
      let dataset:SensorConnectorDataset|undefined;
      const setID = this.sensorConfig.setID;

      for(let i=0; i < this.sensorConnector.datasets.length; i++) {
          if(this.sensorConnector.datasets[i].id === setID.toString()) {
              dataset = this.sensorConnector.datasets[i];
              break;
          }
      }

      if(dataset === undefined) {
          return;
      }

      const timeColumn = this.sensorConfig.timeColumn,
          timeColumnData = timeColumn && this.getDataColumn(timeColumn.id, dataset),
          sensorColumns = this.sensorConfig.dataColumns;

      if(!sensorColumns || !timeColumnData) {
          return;
      }

      const newData:NewSensorData = {},
          timeData = timeColumnData.data || [];

      sensorColumns.forEach((sensorColumn) => {
        // The `dataset &&` is to make the TS compiler happy, I believe a newer version
        // of TS makes this unecessary
        const newSensorData = dataset && this.processSensorColumn(sensorColumn, timeData, dataset);
        if(newSensorData != null) {
          newData[sensorColumn.id] = newSensorData;
        }
      });

      // now we need to send this newData off to the listener
      // Probably we should check if it has any keys
      this.onSensorData(newData);
    }

    getDataColumn(columnID:string, dataset:SensorConnectorDataset) {
        let dataColumns = (dataset && dataset.columns) || [];
        for(var i=0; i < dataColumns.length; i++) {
            var dataColumn = dataColumns[i];
            if((columnID != null) && (dataColumn.id === columnID)) {
                return dataColumn;
            }
        }
        console.log("data column not found (" + columnID + ")");
        return null;
    }

    processSensorColumn(sensorColumn: SensorConfigColumnInfo, timeData: number[],
                        dataset:SensorConnectorDataset) {
      // check the length in the dataset of both it and the time column
      const timeDataLength = timeData.length,
          sensorColumnData = this.getDataColumn(sensorColumn.id, dataset),
          sensorData = (sensorColumnData && sensorColumnData.data) || [],
          sensorDataLength = sensorData.length;

      // columns aren't always updated together
      const newLength = Math.min(timeDataLength, sensorDataLength);

      let info:ColumnInfo|undefined = this.columnInfoById[sensorColumn.id];
      if (info === undefined) {
          info = {lastDataIndex: 0};
          this.columnInfoById[sensorColumn.id] = info;
      }

      const lastDataIndex = info.lastDataIndex;

      // check there's new data for this column
      if (newLength > lastDataIndex) {
          let newTimeData = timeData.slice(lastDataIndex, newLength);
          let newValueData = sensorData.slice(lastDataIndex, newLength);
          let newSensorData = [];
          for(let i=0; i < newTimeData.length; i++) {
              let time = Number(newTimeData[i].toFixed(2));
              // TODO the consumer needs to handle taring as well as
              // stopping the collection when it passes the runLength
              newSensorData.push([time, newValueData[i]]);
          }

          info.lastDataIndex = newLength;

          return newSensorData;
      }

      return null;
    }

}
