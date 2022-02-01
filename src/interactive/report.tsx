import * as React from "react";
import { IReportInitInteractive, useInteractiveState } from "@concord-consortium/lara-interactive-api";
import { IInteractiveState } from "./types";

interface Props {
  initMessage: IReportInitInteractive;
}

export const ReportComponent: React.FC<Props> = ({initMessage}) => {
  const { interactiveState } = useInteractiveState<IInteractiveState>();

  return (
    <div className="padded">
      <fieldset>
        <legend>Report Init Message</legend>
        <div className="padded monospace pre">{JSON.stringify(initMessage, null, 2)}</div>
      </fieldset>
      <fieldset>
        <legend>Report Interactive State</legend>
        <div className="padded monospace pre">{JSON.stringify(interactiveState, null, 2)}</div>
      </fieldset>
    </div>
  );
};
