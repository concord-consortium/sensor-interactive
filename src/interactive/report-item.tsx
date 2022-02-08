import * as React from "react";
import * as ReactDOM from "react-dom";
import { addGetReportItemAnswerListener, getClient, IReportItemInitInteractive,
         sendReportItemAnswer, useAutoSetHeight, useInitMessage } from "@concord-consortium/lara-interactive-api";
import { useEffect } from "react";
import { ReportItemMetricsLegendComponent, reportItemMetricsHtml } from "./report-item-metrics";
import { IAuthoredState, IInteractiveState } from "./types";

export const ReportItemComponent = () => {
  const initMessage = useInitMessage<IReportItemInitInteractive<IInteractiveState, IAuthoredState>, IAuthoredState>();

  useAutoSetHeight();

  useEffect(() => {
    addGetReportItemAnswerListener((request) => {
      // TODO: update lara interactive api to change addGetReportItemAnswerListener to a generic with <IInteractiveState, IAuthoredState>
      // and remove the `any` after request
      const {type, platformUserId, interactiveState, /* authoredState */} = request as any;
      switch (type) {
        case "html":
          const html = reportItemMetricsHtml({interactiveState, platformUserId, interactiveItemId});
          sendReportItemAnswer({type: "html", platformUserId, html});
          break;
      }
    });
    getClient().post("reportItemClientReady");
  }, []);

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

  const {view, interactiveItemId} = initMessage;

  return (
    <div className={`reportItem ${view}`}>
      <ReportItemMetricsLegendComponent view={view} />
    </div>
  );
};

ReactDOM.render(<ReportItemComponent />, document.getElementById("app"));

