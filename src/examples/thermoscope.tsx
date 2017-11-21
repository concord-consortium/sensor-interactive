import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "../components/app";
import { ThermoscopeManager } from "../models/thermoscope-manager";

let sensorManager = new ThermoscopeManager();

// We should add the connect button above the App
// Button was: className="zero-button side-panel-item"
ReactDOM.render(
    <App
      sensorManager={sensorManager}/>,
    document.getElementById("app")
);
