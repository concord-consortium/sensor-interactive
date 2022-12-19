import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "../components/app";
import { SensorRecording } from "../interactive/types";

const recording: SensorRecording = {
  columnID: "100",
  unit: "m",
  precision: 2,
  name: 'Position',
  min: -20,
  max: 40,
  tareValue: 0,
  sensorPosition: 0,
  data: [
    [1,5],
    [2,-5],
    [3,10],
    [4,-10],
    [5,15],
    [6,-15]
  ]
};

const preRecordedData:SensorRecording[] = [
  recording
];

ReactDOM.render(
    <App
      preRecordings={preRecordedData}
      requirePrediction={false}
      fakeSensor={true}
      displayType={"bar"}
      singleReads={true}
      useAuthoredData={true}
      enablePause={true}
    />,
    document.getElementById("app")
);
