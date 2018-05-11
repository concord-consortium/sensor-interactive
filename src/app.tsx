import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";
import { App } from "./components/app";
import { SensorConnectorManager } from "./models/sensor-connector-manager";

let sensorManager = new SensorConnectorManager();

const appElt = document.getElementById("app");
ReactModal.setAppElement(appElt);

ReactDOM.render(
    <App
      sensorManager={sensorManager}/>,
    appElt
);
