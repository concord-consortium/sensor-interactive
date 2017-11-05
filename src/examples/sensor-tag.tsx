import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "../components/app";
import { SensorTagManager } from "../models/sensor-tag-manager";
import Button from "../components/smart-highlight-button";

let sensorManager = new SensorTagManager();

function connectToSensor() {
  sensorManager.connectToSensor();
}

let buttonStyle = {
  position: "absolute",
  left: "50%",
  transform: "translate(-50%)"
};

// We should add the connect button above the App
// Button was: className="zero-button side-panel-item"
ReactDOM.render(
    <div>
      <Button className="connect-to-sensor" style={buttonStyle} onClick={connectToSensor} >
        Connect to Sensor
      </Button>

      <App
        sensorManager={sensorManager}/>
    </div>,
    document.getElementById("app")
);
