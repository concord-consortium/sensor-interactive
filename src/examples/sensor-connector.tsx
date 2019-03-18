import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "../components/app";
import { SensorConnectorManager } from "../models/sensor-connector-manager";

let sensorManager = new SensorConnectorManager();

ReactDOM.render(
    <App
      sensorManager={sensorManager}/>,
    document.getElementById("app")
);