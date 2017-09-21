import { find } from "lodash";

import { ISensorConfig } from "./sensor-connector-interface";

export class SensorConfiguration {
  config:ISensorConfig;

  constructor(config:ISensorConfig) {
    this.config = config;
  }

  get interface() {
    return this.config.currentInterface;
  }

  get hasInterface() {
    return this.interface && (this.interface !== "None Found");
  }

  get setID() {
    // current setID is the largest numeric setID
    const keys = Object.keys(this.config.sets),
          numKeys = keys.map((id) => Number(id));
    return Math.max.apply(Math, numKeys);
  }

  get columns() {
    const setID = this.setID,
          colIDs = this.config.sets[setID].colIDs;
    // setID -> set -> colIDs -> columns
    return colIDs.map((colID) => this.config.columns[colID]);
  }

  getColumnByID(columnID?:string) {
    return columnID != null ? this.config.columns[columnID] : null;
  }

  get timeColumn() {
    return find(this.columns, (col) => col.name === "Time");
  }

  get dataColumns() {
    return this.columns.filter((col) => col.name !== "Time");
  }

  get timeUnit() {
    const timeColumn = this.timeColumn;
    return timeColumn && timeColumn.units;
  }
}