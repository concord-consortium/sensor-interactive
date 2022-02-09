import * as React from "react";
import { IRuntimeInitInteractive, useInteractiveState, setHint } from "@concord-consortium/lara-interactive-api";

import { defaultAuthoredState, IAuthoredState, IInteractiveState } from "./types";
import { App } from "../components/app";

interface Props {
  initMessage: IRuntimeInitInteractive<IInteractiveState, IAuthoredState>;
}

export const RuntimeComponent: React.FC<Props> = ({initMessage}) => {
  const authoredState = initMessage.authoredState || defaultAuthoredState;

  // NOTE: we only use the interactive state from startup, the sensor app maintains its own state during runtime.
  // The interactive state is saved to display at runtime startup and the report and report-item interactive views.
  const initialInteractiveState = initMessage.interactiveState;
  const prompt = authoredState.prompt;
  const { setInteractiveState } = useInteractiveState<IInteractiveState>();
  setHint(authoredState.hint);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: prompt}} />
      <App
        interactiveHost="runtime"
        fakeSensor={authoredState.useFakeSensor}
        singleReads={authoredState.singleReads}
        maxGraphHeight={625}
        initialInteractiveState={initialInteractiveState}
        setInteractiveState={setInteractiveState}
      />
    </>
  );
};
