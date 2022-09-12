import * as React from "react";
import * as Renderer from "react-dom/server";

import { IAuthoredState, IInteractiveState, SensorRecording } from "./types";
import { Sparklines, SparklinesLine, SparklinesBars } from "react-sparklines";
import SparklinesPoints from "./report-item-sparkline-points";

export const ReportItemMetricsLegendComponent = ({view}: {view: "singleAnswer" | "multipleAnswer" | "hidden"}) => {
  // TODO: metricsLegend (empty for now)
  return (
    <div className={`metricsLegend ${view}`} />
  );
};

const SparklineGraph = ({sensorRecording, color, usePoints, useBars}: {sensorRecording?: SensorRecording, color: string, usePoints: boolean, useBars: boolean}) => {

  if (!sensorRecording) {
    return null;
  }

  const roundTo = (n: number, decimalCount: number) => {
    const d = Math.pow(10, decimalCount);
    return Math.round(n * d + Number.EPSILON) / d;
  }

  let min: number|undefined = undefined;
  let max: number|undefined = undefined;
  let data: number[] = [];
  sensorRecording.data.forEach((p, index) => {
    const value = p[1];
    if ((min === undefined) || (max === undefined)) {
      min = max = value;
    } else {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    data.push(value);
  })

  const range = min !== undefined && max !== undefined ? <span>{roundTo(min, 2)} to {roundTo(max, 2)} </span> : "";
  const graphNodes = useBars
                       ? <SparklinesBars />
                       : usePoints
                         ? <SparklinesPoints color={color} />
                         : <SparklinesLine color={color} />

  return (
    <>
      <div>{sensorRecording.name}<br />({range}{sensorRecording.unit})</div>
      {data.length === 0
        ?
          <div className="no-sensor-data">No sensor data available</div>
        :
          <Sparklines data={data} limit={data.length} width={100} height={20} margin={5}>
            {graphNodes}
          </Sparklines>}
    </>
  );
}

export const reportItemMetricsHtml = ({interactiveState, authoredState, platformUserId, interactiveItemId}: {interactiveState: IInteractiveState, authoredState: IAuthoredState, platformUserId: string, interactiveItemId: string}) => {
  const {sensorRecordings} = interactiveState;
  const usePoints = !!(authoredState.singleReads && authoredState.displayType !== "bar");
  const useBars = authoredState.displayType === "bar";

  const metrics = Renderer.renderToStaticMarkup(
    <>
      <SparklineGraph sensorRecording={sensorRecordings[0]} color={"#007fcf"} usePoints={usePoints} useBars={useBars} />
      <SparklineGraph sensorRecording={sensorRecordings[1]} color={"#da5d1d"} usePoints={usePoints} useBars={useBars} />
    </>
  );

  return `
    <style>
      .sparklines {
        font-family: lato, arial, helvetica, sans-serif;
        max-width: 400px;
      }
    </style>
    <div class="sparklines">
      ${metrics}
    </div>`;
};
