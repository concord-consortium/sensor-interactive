import * as React from "react";
import * as Renderer from "react-dom/server";

import { IAuthoredState, IInteractiveState, SensorRecording } from "./types";
import { Sparklines, SparklinesLine } from "react-sparklines";
import SparklinesPoints from "./report-item-sparkline-points";

export const ReportItemMetricsLegendComponent = ({view}: {view: "singleAnswer" | "multipleAnswer"}) => {
  // TODO: metricsLegend (empty for now)
  return (
    <div className={`metricsLegend ${view}`} />
  );
};

const SparklineGraph = ({sensorRecording, color, usePoints}: {sensorRecording?: SensorRecording, color: string, usePoints: boolean}) => {

  if (!sensorRecording) {
    return null;
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

  const range = min !== undefined && max !== undefined ? <span>{min} to {max} </span> : "";

  return (
    <>
      <div>{sensorRecording.name} ({range}{sensorRecording.unit})</div>
      {data.length === 0
        ?
          <div className="no-sensor-data">No sensor data available</div>
        :
          <Sparklines data={data} limit={data.length} width={100} height={20} margin={5}>
            {usePoints ? <SparklinesPoints color={color} /> : <SparklinesLine color={color} />}
          </Sparklines>}
    </>
  );
}

export const reportItemMetricsHtml = ({interactiveState, authoredState, platformUserId, interactiveItemId}: {interactiveState: IInteractiveState, authoredState: IAuthoredState, platformUserId: string, interactiveItemId: string}) => {
  const {sensorRecordings} = interactiveState;
  const usePoints = !!authoredState.singleReads;

  const metrics = Renderer.renderToStaticMarkup(
    <>
      <SparklineGraph sensorRecording={sensorRecordings[0]} color={"#007fcf"} usePoints={usePoints} />
      <SparklineGraph sensorRecording={sensorRecordings[1]} color={"#da5d1d"} usePoints={usePoints} />
    </>
  );

  return `
    <style>
      .tall {
        flex-direction: row;
      }
      .tall > div,
      .wide > div {
        text-align: center;
      }
      .wide > div {
        margin-right: 10px;
      }
      .wide svg {
        max-width: 300px;
      }
      .no-sensor-data {
        margin: 0 10px;
        font-weight: bold;
      }
    </style>
    <div class="tall">
      ${metrics}
    </div>
    <div class="wide">
      ${metrics}
    </div>`;
};
