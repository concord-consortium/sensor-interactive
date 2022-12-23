import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "../components/app";

ReactDOM.render(
    <App
      fakeSensor={true}
      displayType={"bar"}
    />,
    document.getElementById("app")
);
