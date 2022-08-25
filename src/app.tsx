import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";
import App from "./components/app";

const appElt = document.getElementById("app");
ReactModal.setAppElement(appElt);

ReactDOM.render(
  // By default we will be using sensors.
  <App useSensors={true} displayType={"line"}/>,
  appElt
);