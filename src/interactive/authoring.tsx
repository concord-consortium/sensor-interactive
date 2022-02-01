import * as React from "react";
import { IAuthoringInitInteractive } from "@concord-consortium/lara-interactive-api";
import { IAuthoredState } from "./types";

interface Props {
  initMessage: IAuthoringInitInteractive<IAuthoredState>;
}

export const AuthoringComponent: React.FC<Props> = ({initMessage}) => {
  return (
    <div className="padded">
      <fieldset>
        <legend>Authoring Init Message</legend>
        <div className="padded monospace pre">{JSON.stringify(initMessage, null, 2)}</div>
      </fieldset>
    </div>
  );
};
