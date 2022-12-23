import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "../components/app";

ReactDOM.render(
    <App
      fakeSensor={true}
      displayType={"line"}
      prompt={"Collect the fake sensor data"}
      enablePause={true}
      singleReads={true}
    />,
    document.getElementById("app")
);
