export interface IAuthoredState {
  useFakeSensor: boolean;
};

export interface IInteractiveState {};

export const defaultAuthoredState: IAuthoredState = {
  useFakeSensor: false,
};
