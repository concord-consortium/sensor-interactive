import { ISensorConfig } from "../models/sensor-connector-interface";

export interface IAuthoredState {
  useFakeSensor: boolean;
};

export interface IInteractiveState {
  version: 1,
  sensor: {
    data: IInteractiveSensorData[];
    config: ISensorConfig | null;
    runLength: number;
    secondGraph: boolean;
  }
};

export interface IInteractiveSensorData {
  name: string;
  unit: string;
  data: number[][];
}

export const defaultAuthoredState: IAuthoredState = {
  useFakeSensor: false,
};
