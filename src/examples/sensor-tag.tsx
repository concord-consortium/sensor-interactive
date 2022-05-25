import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "../components/app";
import { SensorTagManager } from "../models/sensor-tag-manager";

let sensorManager = new SensorTagManager();

// We should add the connect button above the App
// Button was: className="zero-button side-panel-item"
ReactDOM.render(
    <App
      sensorManager={sensorManager}
    />,
    document.getElementById("app")
);
