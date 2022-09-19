import * as React from "react";
import { useEffect } from "react";
import * as ReactDOM from "react-dom";
import * as semver from "semver";
import { addGetReportItemAnswerListener, getClient, IReportItemInitInteractive, IReportItemAnswerItem, 
         sendReportItemAnswer, useAutoSetHeight, useInitMessage } from "@concord-consortium/lara-interactive-api";
import { ReportItemMetricsLegendComponent, reportItemMetricsHtml } from "./report-item-metrics";
import { IAuthoredState, IInteractiveState } from "./types";

import "./report-item.css";

export const ReportItemComponent = () => {
  const initMessage = useInitMessage<IReportItemInitInteractive<IInteractiveState, IAuthoredState>, IAuthoredState>();

  useAutoSetHeight();

  useEffect(() => {
    if (initMessage && initMessage.mode === "reportItem") {
      const {interactiveItemId} = initMessage;

      addGetReportItemAnswerListener((request) => {
        // TODO: update lara interactive api to change addGetReportItemAnswerListener to a generic with <IInteractiveState, IAuthoredState>
        // and remove the `any` after request
        const { platformUserId, interactiveState, authoredState, version } = request as any;

        if (!version) {
          // for hosts sending older, unversioned requests
          console.error("Missing version in getReportItemAnswer request.");
        } else if (semver.satisfies(version, "2.x")) {
          const html = reportItemMetricsHtml({interactiveState, authoredState, platformUserId, interactiveItemId});
          const items: IReportItemAnswerItem[] = [
            {
              type: "html",
              html
            },
            {
              type: "links",
              hideViewInNewTab: false,
              hideViewInline: false
            }
          ];
          sendReportItemAnswer({version, platformUserId, items, itemsType: "fullAnswer"});
        } else {
          console.error("Unsupported version in getReportItemAnswer request:", version);
        }
      });
      getClient().post("reportItemClientReady");
    }
}, [initMessage]);

  if (!initMessage) {
    return (
      <div className="centered">
        <div className="progress">
          Loading...
        </div>
      </div>
    );
  }

  if (initMessage.mode !== "reportItem") {
    return (
      <div className="centered">
        Wrong url.  The main interactive url is index.html.
      </div>
    );
  }

  const {view} = initMessage;

  return (
    <div className={`reportItem ${view}`}>
      <ReportItemMetricsLegendComponent view={view} />
    </div>
  );
};

ReactDOM.render(<ReportItemComponent />, document.getElementById("app"));
