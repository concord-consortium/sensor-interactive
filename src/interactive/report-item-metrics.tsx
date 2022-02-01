import * as React from "react";
import { IInteractiveState } from "./types";

export const ReportItemMetricsLegendComponent = ({view}: {view: "singleAnswer" | "multipleAnswer"}) => {
  return (
    <div className={`metricsLegend ${view}`}>
      TODO: metricsLegend
    </div>
  );
};

export const reportItemMetricsHtml = ({interactiveState, platformUserId, interactiveItemId}: {interactiveState: IInteractiveState, platformUserId: string, interactiveItemId: string}) => {
  let metrics: string = "TODO: metricsReportItemHtml";

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
    </style>
    <div class="tall">
      ${metrics}
    </div>
    <div class="wide">
      ${metrics}
    </div>`;
};

