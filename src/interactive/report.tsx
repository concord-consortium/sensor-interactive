import * as React from "react";
import { IReportInitInteractive } from "@concord-consortium/lara-interactive-api";

import { IAuthoredState, IInteractiveState } from "./types";
import { App } from "../components/app";

interface Props {
  initMessage: IReportInitInteractive<IInteractiveState, IAuthoredState>;
}

export const ReportComponent: React.FC<Props> = ({initMessage}) => {
  const initialInteractiveState = initMessage.interactiveState;

  return (
    <App
      interactiveHost="report"
      fakeSensor={true}
      maxGraphHeight={625}
      initialInteractiveState={initialInteractiveState}
    />
  );
};
