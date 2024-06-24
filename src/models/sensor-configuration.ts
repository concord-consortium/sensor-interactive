import { find } from "lodash";

import { SensorConfig } from "@concord-consortium/sensor-connector-interface";

/**
 * This is a duplication of ISensorConfigColumnInfo from sensor-connector-interface.
 * It provides a place to add documentation about these fields.
 * 
 * TODO: Refactor this further by duplicating ISensorConfig. This way most managers 
 * will not be relying on the sensor-connector-interface types.
 */
export interface ISensorConfigurationColumnInfo {
  /**
   * The column id. This will often change on each collection.
   */
  id:string;

  /**
   * The id of the dataset this column is for
   */
  setID:string;

  /**
   * The `position` property of the column is used for devices that
   * support multiple sensors. The columnID might change on each collection,
   * but the position will remain the same. This is useful when the device 
   * provides multiple sensors of the same type. For example a device with
   * two temperature sensors.
   * 
   * For interfaces like the LabQuest and LabQuest mini which have
   * multiple ports. The `position` represents which port the sensor
   * is plugged into. TODO: what is the position when a "multi-sensor" is 
   * plugged into a LabQuest.
   * 
   * For devices that have multiple built in sensors the position should
   * be different for each sensor. 
   */
  position:number;
  name:string;
  units:string;
  liveValue:string;
  liveValueTimeStamp:Date;
  valueCount:number;
  valuesTimeStamp:Date;
  data?:number[];
}

export class SensorConfiguration {
  // We'd like to abstract the SensorConfiguration from the SensorConnector
  // so instead of accessing the ISensorConfig directly, please add accessor methods
  // to make it easier to do this abstraction in the future
  private config:SensorConfig | null;

  constructor(config:SensorConfig | null) {
    this.config = config;
  }

  get interface() {
    return this.config && this.config.currentInterface;
  }

  get hasInterface() {
    return this.interface && (this.interface !== "None Found");
  }

  get requestTimeStamp() {
    return this.config && this.config.requestTimeStamp;
  }

  // retrieve ID of the current dataset
  get setID() {
    // current setID is the largest numeric setID
    if (!this.config) { return; }
    const keys = Object.keys(this.config.sets),
          numKeys = keys.map((id) => Number(id));
    return Math.max.apply(Math, numKeys);
  }

  // retrieve columns for current dataset
  get columns(): ISensorConfigurationColumnInfo[] | undefined {
    if (!this.config) { return; }
    const setID = this.setID,
          colIDs = this.config.sets[setID].colIDs;
    // setID -> set -> colIDs -> columns
    return colIDs.map((colID) => (this.config as SensorConfig).columns[colID]);
  }

  getColumnByID(columnID?:string): ISensorConfigurationColumnInfo | undefined {
    return this.config && (columnID != null) ? this.config.columns[columnID] : undefined;
  }

  // retrieve "Time" column for current dataset
  get timeColumn() {
    return find(this.columns, (col) => (col != null) && (col.name === "Time"));
  }

  // retrieve non-"Time" columns for current dataset
  get dataColumns() {
    return this.columns && this.columns.filter((col) => (col != null) && (col.name !== "Time"));
  }

  get timeUnit() {
    const timeColumn = this.timeColumn;
    return timeColumn && timeColumn.units;
  }

  get currentConfig() {
    return this.config;
  }
}

export const gNullSensorConfig = new SensorConfiguration(null);
