export interface SensorRecording {
  columnID: string;
  sensorID: number;
  unit: string;
  precision: number;
  name: string;
  min: number;
  max: number;
  tareValue: number;
  sensorPosition: number;
  data: number[][];
  displayUnits?: string;
}

export interface IAuthoredMinMax {
  authoredXMin?: number;
  authoredXMax?: number;
  authoredYMin?: number;
  authoredYMax?: number;
}

export interface IAuthoredState {
  useFakeSensor: boolean;
  useSensors: boolean;
  singleReads: boolean;
  enablePause: boolean;
  usePrediction: boolean;
  useAuthoredData: boolean;
  overrideAxes: boolean;
  prompt: string;
  hint: string;
  sensorUnit?: string;
  recordedData?: SensorRecording;
  displayType: string;
  authoredMinMax?: IAuthoredMinMax;
};

export interface IInteractiveState {
  version: 1;
  sensorRecordings: SensorRecording[];
  runLength: number;
  prediction: number[][];
};

export interface IInteractiveSensorData {
  name: string;
  unit: string;
  data: number[][];
}

export const defaultAuthoredState: IAuthoredState = {
  useFakeSensor: false,
  useSensors: false,
  singleReads: false,
  enablePause: false,
  usePrediction: false,
  useAuthoredData: false,
  overrideAxes: false,
  prompt: "",
  hint: "",
  sensorUnit: undefined,
  displayType: "line"
};
