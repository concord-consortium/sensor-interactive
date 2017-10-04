export interface ISensorDefinition {
  sensorName:string|null;
  measurementName:string;
  measurementType:string;
  tareable:boolean;
  minReading:number;
  maxReading:number;
}

export interface ISensorConnectorDataset {
  id:string;
  columns:ISensorConfigColumnInfo[];
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

interface ISensorConfigSet {
  name:string;
  colIDs:number[];
}

export interface ISensorConfig {
  collection:{ canControl:boolean; isCollecting:boolean; };
  columnListTimeStamp:Date;
  columns:{ [key:string]: ISensorConfigColumnInfo; };
  currentInterface:string;
  currentState:string;
  os:{ name:string; version:string; };
  requestTimeStamp:Date;
  server:{ arch:string; version:string; };
  sessionDesc:string;
  sessionID:string;
  sets:{ [key:string]: ISensorConfigSet; };
  setID?:string;
}

export interface IMachinaAction {
  inputType:string;
  delegated:boolean;
  ticket:any;
}

export interface IStatusReceivedTuple
        extends Array<IMachinaAction|ISensorConfig>
                  {0:IMachinaAction, 1:ISensorConfig}

export interface IColumnDataTuple
        extends Array<IMachinaAction|string|number[]|Date>
                  {0:IMachinaAction, 1:string, 2:number[], 3:Date}
