import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "../components/app";
import { FakeSensorManager } from "../models/fake-sensor-manager";

let sensorManager = new FakeSensorManager();

ReactDOM.render(
    <App
      sensorManager={sensorManager}/>,
    document.getElementById("app")
);
