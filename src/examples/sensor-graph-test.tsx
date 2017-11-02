import * as React from "react";
import * as ReactDOM from "react-dom";
import SensorGraph from "../components/sensor-graph";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";

var sensorConnector = {
  on: function() {
    // something
  }
};

var sensorColumns:any[] = [];

var sensorSlot = new SensorSlot(0, new Sensor());

function onAppendData() {
  // something
}

function onGraphZoom() {
  // something
}

function onSensorSelect() {
  // something
}

function onZeroSensor() {
  // something
}

function onStopCollection() {
  // something
}


ReactDOM.render(
    <SensorGraph
      width={600}
      height={400}
      sensorConnector={sensorConnector}
      sensorColumns={sensorColumns}
      sensorSlot={sensorSlot}
      title="Test Graph"
      isSingletonGraph={true}
      isLastGraph={true}
      onAppendData={onAppendData}
      onGraphZoom={onGraphZoom}
      onSensorSelect={onSensorSelect}
      onZeroSensor={onZeroSensor}
      onStopCollection={onStopCollection}
      xStart={0}
      xEnd={20}
      timeUnit="s"
      runLength={20}
      collecting={false}
      hasData={false}
      dataReset={false}
      />,
    document.getElementById("app")
);
