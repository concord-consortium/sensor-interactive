import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";
import App from "../components/app";

const appElt = document.getElementById("app");
ReactModal.setAppElement(appElt);

ReactDOM.render(
    <App
      displayType={"line"}
    />,
    appElt
);
