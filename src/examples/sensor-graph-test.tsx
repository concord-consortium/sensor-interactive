import * as React from "react";
import * as ReactDOM from "react-dom";
import SensorGraph from "../components/sensor-graph";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";
import { ISensorConfigColumnInfo } from "../models/sensor-connector-interface";

var sensorConnector = {
  on: function(eventName:string, callback:any) {
    // something
  }
};

// Define some fake column info. The units from these are taken from sensor-definitions.
// the rest of the values are made up, with the hopes that they work
// This column info is used by the sensor selector in the GraphSidePanel
var sensorColumns:ISensorConfigColumnInfo[] = [
  {
    id: "fake-temperature",
    setID: "setID-not-sure",
    position: 1,
    name: "Temperature",
    units: "°C",
    liveValue: "",
    liveValueTimeStamp: new Date(),
    valueCount: 0,
    valuesTimeStamp: new Date()
  },
  {
    id: "fake-light",
    setID: "setID-not-sure",
    position: 1,
    name: "Light",
    units: "lux",
    liveValue: "",
    liveValueTimeStamp: new Date(),
    valueCount: 0,
    valuesTimeStamp: new Date()
  }
];

// The Sensor holds a definition describing the data being graphed as well as a sensorValue
// which is used by the GraphSidePanel to show the current value
var sensor = new Sensor();
// The sensorSlot refers to the sensor and holds the data that the graph is displaying
var sensorSlot = new SensorSlot(0, sensor);

// It looks like we could add data to the sensorSlot on a timer and that would
// make it show up in the graph. I'm not sure if React would need to be notified
// each time we add data or not.

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

var sensorGraph;
var xEnd = 20;

function render() {
  sensorGraph = ReactDOM.render(
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
        xEnd={xEnd}
        timeUnit="s"
        runLength={20}
        collecting={false}
        hasData={false}
        dataReset={false}
        />,
      document.getElementById("app")
  );
}


var time = 0;
setInterval(function() {
    var value = Math.sin(time/(2*Math.PI)) + 5;
    console.log(`Adding data time: ${time} val: ${value}`);
    sensorSlot.appendData([[time, value]]);
    time += 1;
    sensor.sensorValue = value;

    // Add hacky support for autoscroll
    if (time > xEnd) {
      xEnd = xEnd * 1.2;
    }

    // re-render the component, by itself this is broken because things like auto resize
    // get overridden as soon as the new data shows up
    render();
  }, 500);
