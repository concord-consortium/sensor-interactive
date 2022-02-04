import * as React from "react";
import { IAuthoringInitInteractive, useAuthoredState } from "@concord-consortium/lara-interactive-api";

import { defaultAuthoredState, IAuthoredState } from "./types";

interface Props {
  initMessage: IAuthoringInitInteractive<IAuthoredState>;
}

export const AuthoringComponent: React.FC<Props> = ({initMessage}) => {
  const {authoredState, setAuthoredState} = useAuthoredState<IAuthoredState>();
  const { useFakeSensor } = authoredState || defaultAuthoredState;

  const handleFakeSensor = (e: React.ChangeEvent<HTMLInputElement>) => setAuthoredState({useFakeSensor: e.target.checked});

  return (
    <div className="authoring">
      <fieldset>
        <legend>Sensor Types</legend>
        <input type="checkbox" checked={useFakeSensor} onChange={handleFakeSensor} /> Use fake sensor
      </fieldset>
    </div>
  );
};
