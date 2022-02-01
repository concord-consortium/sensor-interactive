import * as React from "react";
import { useEffect } from "react";
import { IRuntimeInitInteractive, useInteractiveState } from "@concord-consortium/lara-interactive-api";

import { IAuthoredState, IInteractiveState } from "./types";

interface Props {
  initMessage: IRuntimeInitInteractive<{}, IAuthoredState>;
}

export const RuntimeComponent: React.FC<Props> = ({initMessage}) => {
  const { interactiveState, setInteractiveState } = useInteractiveState<IInteractiveState>();

  useEffect(() => {
    setInteractiveState({});
  }, []);

  return (
    <div className="padded">
      <fieldset>
        <legend>Runtime Init Message</legend>
        <div className="padded monospace pre">{JSON.stringify(initMessage, null, 2)}</div>
      </fieldset>
      <fieldset>
        <legend>Runtime Interactive State</legend>
        <div className="padded monospace pre">{JSON.stringify(interactiveState, null, 2)}</div>
      </fieldset>
    </div>
  );
};
