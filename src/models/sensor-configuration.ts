import { find } from "lodash";

import { ISensorConfig } from "./sensor-connector-interface";

export class SensorConfiguration {
  // We'd like to abstract the SensorConfiguration from the SensorConnector
  // so instead of accessing the ISensorConfig directly, please add accessor methods
  // to make it easier to do this abstraction in the future
  private config:ISensorConfig | null;

  constructor(config:ISensorConfig | null) {
    this.config = config;
  }

  get interface() {
    return this.config && this.config.currentInterface;
  }

  get hasInterface() {
    return this.interface && (this.interface !== "None Found");
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
  get columns() {
    if (!this.config) { return; }
    const setID = this.setID,
          colIDs = this.config.sets[setID].colIDs;
    // setID -> set -> colIDs -> columns
    return colIDs.map((colID) => (this.config as ISensorConfig).columns[colID]);
  }

  getColumnByID(columnID?:string) {
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
}

export const gNullSensorConfig = new SensorConfiguration(null);
