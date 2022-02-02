import * as React from "react";
import { IRuntimeInitInteractive, useInteractiveState } from "@concord-consortium/lara-interactive-api";

import { IAuthoredState, IInteractiveState, /* IInteractiveState */ } from "./types";
import { App } from "../components/app";
interface Props {
  initMessage: IRuntimeInitInteractive<{}, IAuthoredState>;
}

export const RuntimeComponent: React.FC<Props> = ({initMessage}) => {
  const { interactiveState, setInteractiveState } = useInteractiveState<IInteractiveState>();

  return (
    <App
      interactiveHost="runtime"
      fakeSensor={true}
      maxGraphHeight={625}
      interactiveState={interactiveState}
      setInteractiveState={setInteractiveState}
    />
  );
};
