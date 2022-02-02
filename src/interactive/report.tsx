import * as React from "react";
import { IReportInitInteractive, useInteractiveState } from "@concord-consortium/lara-interactive-api";

import { IInteractiveState } from "./types";
import { App } from "../components/app";

interface Props {
  initMessage: IReportInitInteractive;
}

export const ReportComponent: React.FC<Props> = ({initMessage}) => {
  const { interactiveState } = useInteractiveState<IInteractiveState>();

  return (
    <App
      interactiveHost="report"
      fakeSensor={true}
      maxGraphHeight={625}
      interactiveState={interactiveState}
    />
  );
};
