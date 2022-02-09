import * as React from "react";
import { IAuthoringInitInteractive, useAuthoredState } from "@concord-consortium/lara-interactive-api";

import { defaultAuthoredState, IAuthoredState } from "./types";

interface Props {
  initMessage: IAuthoringInitInteractive<IAuthoredState>;
}

export const AuthoringComponent: React.FC<Props> = ({initMessage}) => {
  const {authoredState, setAuthoredState} = useAuthoredState<IAuthoredState>();
  const { useFakeSensor } = authoredState || defaultAuthoredState;
  const { singleReads } = authoredState || defaultAuthoredState;

  const updateAuthoredState = (update: Partial<IAuthoredState>) => {
    setAuthoredState({
      useFakeSensor,
      singleReads,
      ...update,
    });
  }

  const handleFakeSensor = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({useFakeSensor: e.target.checked});
  const handlesingleReads = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({singleReads: e.target.checked});

  return (
    <div className="authoring">
      <fieldset>
        <legend>Sensor Types</legend>
        <input type="checkbox" checked={useFakeSensor} onChange={handleFakeSensor} /> Use fake sensor
      </fieldset>
      <fieldset>
        <legend>Data Acquisition</legend>
        <input type="checkbox" checked={singleReads} onChange={handlesingleReads} /> Single reads
      </fieldset>
    </div>
  );
};
