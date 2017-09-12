export interface ISensorDefinition {
  sensorName:string|null;
  measurementName:string;
  measurementType:string;
  tareable:boolean;
  minReading:number;
  maxReading:number;
}

interface ISensorConfigCollection {
  canControl:boolean;
  isCollecting:boolean;
}

export interface ISensorConfigColumnInfo {
  id:string;
  setID:string;
  position:number;
  name:string;
  units:string;
  liveValue:string;
  liveValueTimeStamp:Date;
  valueCount:number;
  valuesTimeStamp:Date;
  data?:number[];
}

export interface ISensorConnectorDataset {
  id:string;
  columns:ISensorConfigColumnInfo[];
}

interface ISensorConfigColumns {
  [key:string]: ISensorConfigColumnInfo;
}

interface ISensorConfigOS {
  name:string;
  version:string;
}

interface ISensorConfigServer {
  arch:string;
  version:string;
}

interface ISensorConfigSet {
  name:string;
  colIDs:number[];
}

interface ISensorConfigSets {
  [key:string]: ISensorConfigSet;
}

export interface ISensorConfig {
  collection:ISensorConfigCollection;
  columnListTimeStamp:Date;
  columns:ISensorConfigColumns;
  currentInterface:string;
  currentState:string;
  os:ISensorConfigOS;
  requestTimeStamp:Date;
  server:ISensorConfigServer;
  sessionDesc:string;
  sessionID:string;
  sets:ISensorConfigSets;
  setID?:string;
}
