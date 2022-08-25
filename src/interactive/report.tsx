import * as React from "react";
import { IReportInitInteractive } from "@concord-consortium/lara-interactive-api";

import { IAuthoredState, IInteractiveState } from "./types";
import App from "../components/app";

interface Props {
  initMessage: IReportInitInteractive<IInteractiveState, IAuthoredState>;
}

export const ReportComponent: React.FC<Props> = ({initMessage}) => {
  const initialInteractiveState = initMessage.interactiveState;
  const authoredState = initMessage.authoredState;

  return (
    <App
      interactiveHost="report"
      fakeSensor={true}
      displayType={authoredState.displayType}
      initialInteractiveState={initialInteractiveState}
    />
  );
};
