import * as React from "react";
import * as ReactDOM from "react-dom";
import { Graph } from "../components/graph";

var data = [[1,2],
        [2,3],
        [3,4]];

function onZoom() {
  // something
}

ReactDOM.render(
    <Graph
      title="Test Graph"
      width={600}
      height={400}
      data={data}
      onZoom={onZoom}
      xMin={0}
      xMax={10}
      yMin={0}
      yMax={10}
      xLabel="Time"
      yLabel="Temperature"
      />,
    document.getElementById("app")
);
