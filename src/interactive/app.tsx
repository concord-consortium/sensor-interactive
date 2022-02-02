import * as React from "react";
import { useEffect } from "react";

import { useInitMessage, setSupportedFeatures, useAutoSetHeight } from "@concord-consortium/lara-interactive-api";
import { AuthoringComponent } from "./authoring";
import { ReportComponent } from "./report";
import { RuntimeComponent } from "./runtime";
import { IAuthoredState, IInteractiveState } from "./types";

interface Props {
}

export const AppComponent: React.FC<Props> = (props) => {
  const initMessage = useInitMessage<IInteractiveState, IAuthoredState>();

  useAutoSetHeight();

  useEffect(() => {
    if (initMessage) {
      setSupportedFeatures({
        authoredState: true,
        interactiveState: true
      });
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

  if (initMessage.mode === "reportItem") {
    return (
      <div className="centered">
        Wrong url.  The report item url is report-item.html.
      </div>
    );
  }

  switch (initMessage.mode) {
    case "authoring":
      return <AuthoringComponent initMessage={initMessage} />;
    case "report":
      return <ReportComponent initMessage={initMessage} />;
    case "runtime":
      return <RuntimeComponent initMessage={initMessage} />;
  }
};
