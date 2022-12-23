import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "../components/app";

ReactDOM.render(
    <App
      requirePrediction={true}
      fakeSensor={true}
      displayType={"line"}
    />,
    document.getElementById("app")
);
