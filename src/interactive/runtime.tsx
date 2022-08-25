import * as React from "react";
import { IRuntimeInitInteractive, useInteractiveState, setHint } from "@concord-consortium/lara-interactive-api";

import { defaultAuthoredState, IAuthoredState, IInteractiveState, SensorRecording } from "./types";
import App from "../components/app";

interface Props {
  initMessage: IRuntimeInitInteractive<IInteractiveState, IAuthoredState>;
}


const getRecordings = (useAuthoredData: boolean, recordedData?: SensorRecording): SensorRecording[] => {
  if (!recordedData) {
    return [];
  }
  const recording = {...recordedData};
  // remove the data from the recording if we are just specifying the the sensor
  // names, units, min/max values, etc. The authored data might include data
  // from a previous save, we retain that, but we don't want to show it.
  if (!useAuthoredData) {
    recording.data = [];
  } else {
    // We want the max to be set to the next nearest tick after the greatest value.
    recording.max = recording.data.reduce((max, point) => Math.max(max, point[1] + 1), recording.max);
  }
  return [recording];
}

export const RuntimeComponent: React.FC<Props> = ({initMessage}) => {
  const authoredState = initMessage.authoredState || defaultAuthoredState;
  // NOTE: we only use the interactive state from startup, the sensor app maintains its own state during runtime.
  // The interactive state is saved to display at runtime startup and the report and report-item interactive views.
  const initialInteractiveState = initMessage.interactiveState;
  const {prompt, hint, recordedData, usePrediction, useAuthoredData, sensorUnit} = authoredState;
  const { setInteractiveState } = useInteractiveState<IInteractiveState>();
  // The authored data, or presence of prediction means that we should try to set
  // units, name, and max/min values for the sensor:
  const recordings = useAuthoredData ? getRecordings(useAuthoredData, recordedData) : [];
  if(hint) { setHint(hint) };
  return (
      <App
        prompt={prompt}
        interactiveHost="runtime"
        fakeSensor={authoredState.useFakeSensor}
        useSensors={authoredState.useSensors}
        singleReads={authoredState.singleReads}
        enablePause={authoredState.enablePause}
        initialInteractiveState={initialInteractiveState}
        preRecordings ={recordings}
        requirePrediction={usePrediction}
        sensorUnit={sensorUnit}
        setInteractiveState={setInteractiveState}
        displayType={authoredState.displayType}
      />
  );
};
