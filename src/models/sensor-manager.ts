import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";
import { IStatusReceivedTuple, ISensorConfigColumnInfo } from "./sensor-connector-interface";
import { SensorConfiguration } from "./sensor-configuration";
import { ISensorConnectorDataset } from "./sensor-connector-interface";

export interface NewSensorData {
  [key:string]: number[][];
}

export interface SensorManagerListeners {
  onSensorConnect? : (sensorConfig: SensorConfiguration) => void;
  onSensorData? : (newData:NewSensorData) => void;
  onSensorCollectionStopped?: () => void;
  onSensorStatus?: (sensorConfig:SensorConfiguration) => void;
}

export interface ISensorManager {
  listeners:SensorManagerListeners;
  startPolling() : void;
  sensorHasData() : boolean;
  requestStart() : void;
  requestStop() : void;
}

const SENSOR_IP = "http://127.0.0.1:11180";

interface ColumnInfo {
  lastDataIndex: number
}

export class SensorConnectorManager implements ISensorManager {
    listeners:SensorManagerListeners = {};

    private sensorConnector:any;
    private columnInfoById:{ [key:string]: ColumnInfo } = {};
    private sensorConfig: SensorConfiguration;

    constructor() {
      this.sensorConnector = new SensorConnectorInterface();

      // Stop it from collecting incase it was left in a collecting state
      this.sensorConnector.requestStop();

      this.sensorConnector.on("interfaceConnected", this.handleSensorConnect);
      this.sensorConnector.on("interfaceRemoved", this.handleSensorConnect);
      this.sensorConnector.on("columnAdded", this.handleSensorConnect);
      this.sensorConnector.on("columnMoved", this.handleSensorConnect);
      this.sensorConnector.on("columnRemoved", this.handleSensorConnect);
      this.sensorConnector.on("datasetAdded", this.handleSensorConnect);

      this.sensorConnector.on("data", this.handleSensorData);

      // CHECKME: the old added and removed this listener each time it is needed
      // perhaps the sensorConnector code assumes this and won't handle this right
      this.sensorConnector.on("collectionStopped", this.handleSensorCollectionStopped);

      this.sensorConnector.on("statusReceived", this.handleSensorStatus);
    }

    startPolling() {
      this.sensorConnector.startPolling(SENSOR_IP);
    }

    sensorHasData() {
      return this.sensorConnector.datasets[0] &&
          this.sensorConnector.datasets[0].columns[1];
    }

    requestStart() {
      this.sensorConnector.requestStart();
    }

    requestStop() {
      this.sensorConnector.requestStop();
    }

    handleSensorConnect = () => {
        const statusReceived:IStatusReceivedTuple = this.sensorConnector.stateMachine.currentActionArgs,
            config = statusReceived[1];

        this.sensorConfig = new SensorConfiguration(config);

        if(this.listeners.onSensorConnect) {
            this.listeners.onSensorConnect(this.sensorConfig);
        }
    }

    handleSensorCollectionStopped = () => {
        if(this.listeners.onSensorCollectionStopped) {
            this.listeners.onSensorCollectionStopped();
        }
    }

    handleSensorStatus = () => {
        const statusReceived:IStatusReceivedTuple = this.sensorConnector.stateMachine.currentActionArgs,
            config = statusReceived[1];
        this.sensorConfig = new SensorConfiguration(config);
        if(this.listeners.onSensorStatus) {
            this.listeners.onSensorStatus(this.sensorConfig);
        }
    }

    // this is the id of the column that has new data
    handleSensorData = (columnId:string) => {
      // The main app, uses this for:
      // 1. to determine that the sensor has started collecting. This
      //    looks for the any call to onSensorData.
      // 2. To stop the sensor or record the lastTime.
      //    It records the lastTime in one event, and then on the next
      //    event if the lastTime is greater than the runLength then
      //    the sensor is stopped.

      // The SensorGraph
      // 1. Looks up the dataset that matches the setId with:
      //    this.props.sensorConnector.datasets[i].id === setId
      // 2. Gets the timeData out of the dataset, gets the column data
      //    out based on the SensorGraph's stored columnID sensorSlot.sensor.columnID
      // 3. Checks if there is newData by comparing the min lenght of the two columns
      // 4. Extracts just the newData out of the two columns
      // 5. Creates a new [][] with [time, value],[time, value]...
      // 6. calls onAppendData which sets the data on the Sensor object
      // 7. tiggers a rerender

      // We could possibly do this data conversion in the SensorManager so that it
      // sends data in the nicely formated style which would make it easier for others
      // to implement new views from the SensorManager
      // This means we need to use the column id and look up if we have the time data
      // for this column yet.  If we do then we send all of the new data with its time.
      // The problem is that if the value data comes in first, then we'd need to send it
      // later when the time data comes in.  Also this means we'll be sending data for
      // all of the columns which means creating a lot of extra stuff.  It would be better
      // If the SensorManager knew which valueColumns we cared about and just send ISensorConfigColumnInfo
      // about those.

      //However this means we need more than just the SensorManager, we'd need to add
      // a listener on the Sensor itself, and let it then notify the stuff listening
      // to it. Here is something weird.  In the App the argument is columnID, but
      // in the SensorGraph it is setId.

      // 1. Check if this a time column
      // 2. If it is a time column then see if there are and data columns
      //    which haven't been sent down to the onSensorData listener
      // 3. If it is a data column then see if the time column has enough data
      //    so we can send down all of the data to the onSensorData
      // We can use the data in the sensorConfig to find the active dataset
      // and then lookup the data for the active sensors.
      // We will need a way to indicate which sensor/column this data is for
      // Perhaps the easiest approach is to just go through all of the columns
      // all of the time.  Then send a object that has is:
      // { columnID1: [[time, value][time, value]], columnID2: ...}
      let _dataset:ISensorConnectorDataset|undefined;
      const setID = this.sensorConfig.setID;

      for(let i=0; i < this.sensorConnector.datasets.length; i++) {
          // setID is a number, but the dataset id is a string
          if(this.sensorConnector.datasets[i].id == setID) {
              _dataset = this.sensorConnector.datasets[i];
              break;
          }
      }

      if(_dataset === undefined) {
          return;
      }
      let dataset:ISensorConnectorDataset = _dataset as ISensorConnectorDataset;

      const timeColumn = this.sensorConfig.timeColumn,
          timeColumnData = timeColumn && this.getDataColumn(timeColumn.id, dataset),
          sensorColumns = this.sensorConfig.dataColumns;

      if(!sensorColumns || !timeColumnData) {
          return;
      }

      const newData:NewSensorData = {},
          timeData = timeColumnData.data || [];

      sensorColumns.forEach((sensorColumn) => {
        const newSensorData = this.processSensorColumn(sensorColumn, timeData, dataset);
        if(newSensorData != null) {
          newData[sensorColumn.id] = newSensorData;
        }
      });

      // now we need to send this newData off to the listener
      // Probably we should check if it has any keys
      if (this.listeners.onSensorData) {
          this.listeners.onSensorData(newData);
      }
    }

    getDataColumn(columnID:string, dataset:ISensorConnectorDataset) {
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

    processSensorColumn(sensorColumn: ISensorConfigColumnInfo, timeData: number[],
        dataset:ISensorConnectorDataset) {
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
              // TODO the consumer needs to hande taring as well was
              // stoping the collection when it passes the runLength
              newSensorData.push([time, newValueData[i]]);
          }

          info.lastDataIndex = newLength;

          return newSensorData;
      }

      return null;
    }

}
