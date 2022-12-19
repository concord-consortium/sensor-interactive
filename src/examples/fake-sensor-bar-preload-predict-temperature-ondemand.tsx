import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "../components/app";
import { SensorRecording } from "../interactive/types";

const recording: SensorRecording = {
  columnID: "100",
  unit: "degC",
  precision: 2,
  name: 'Temperature',
  min: 0,
  max: 40,
  tareValue: 0,
  sensorPosition: 0,
  data: [
    [1,10],
    [2,50],
    [3,30],
    [4,30],
    [5,20],
    [6,10]
  ]
};

const preRecordedData:SensorRecording[] = [
  recording
];

ReactDOM.render(
    <App
      preRecordings={preRecordedData}
      requirePrediction={true}
      fakeSensor={true}
      displayType={"bar"}
      useAuthoredData={true}
    />,
    document.getElementById("app")
);
