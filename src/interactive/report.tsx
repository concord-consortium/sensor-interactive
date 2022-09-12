import * as React from "react";
import { useEffect, useState } from "react";
import { IReportInitInteractive, useAuthoredState } from "@concord-consortium/lara-interactive-api";

import { IAuthoredState, IInteractiveState } from "./types";
import App from "../components/app";

interface Props {
  initMessage: IReportInitInteractive<IInteractiveState, IAuthoredState>;
}

export const ReportComponent: React.FC<Props> = ({initMessage}) => {
  const initialInteractiveState = initMessage.interactiveState;
  const { authoredState } = useAuthoredState<IAuthoredState>();
  const [displayType, setDisplayType] = useState<string>("");
  const [singleReads, setSingleReads] = useState<boolean>(false);

  useEffect(() => {
    if (authoredState) {
      setDisplayType(authoredState.displayType);
      setSingleReads(authoredState.singleReads);
    }
  }, [authoredState]);

  if (displayType === "") {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <App
      interactiveHost="report"
      fakeSensor={true}
      displayType={displayType}
      singleReads={singleReads}
      initialInteractiveState={initialInteractiveState}
    />
  );
};
