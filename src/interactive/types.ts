export interface SensorRecording {
  columnID: string;
  unit: string;
  precision: number;
  name: string;
  min: number;
  max: number;
  tareValue: number;
  sensorPosition: number;
  data: number[][];
}

export interface IAuthoredState {
  useFakeSensor: boolean;
  singleReads: boolean;
  prompt: string;
  hint: string;
};

export interface IInteractiveState {
  version: 1;
  sensorRecordings: SensorRecording[];
  runLength: number;
};

export interface IInteractiveSensorData {
  name: string;
  unit: string;
  data: number[][];
}

export const defaultAuthoredState: IAuthoredState = {
  useFakeSensor: false,
  singleReads: false,
  prompt: "",
  hint: ""
};
