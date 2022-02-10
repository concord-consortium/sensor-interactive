import * as React from "react";
import { IAuthoringInitInteractive, useAuthoredState } from "@concord-consortium/lara-interactive-api";
import { RichTextWidget } from "../components/rich-text-widget";
import { defaultAuthoredState, IAuthoredState } from "./types";

interface Props {
  initMessage: IAuthoringInitInteractive<IAuthoredState>;
}

export const AuthoringComponent: React.FC<Props> = ({initMessage}) => {
  const {authoredState, setAuthoredState} = useAuthoredState<IAuthoredState>();
  const { singleReads, useFakeSensor, prompt, hint } = authoredState || defaultAuthoredState;

  const handlesingleReads = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({singleReads: e.target.checked});

  const updateAuthoredState = (newState: Partial<IAuthoredState>) => {
    setAuthoredState( prev => {
      const newValue = {...(prev || defaultAuthoredState), ...newState};
      return newValue;
    });
  };

  const handleFakeSensor = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({useFakeSensor: e.target.checked});

  const textWidgetBlur = (id: string, value: string) => {
    if(id === "prompt") { updateAuthoredState({prompt: value}); }
    if(id === "hint") { updateAuthoredState({hint: value}); }
  }

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
      <fieldset>
        <legend>Prompt</legend>
        <RichTextWidget id="prompt" value={prompt} onBlur={textWidgetBlur}/>
      </fieldset>
      <fieldset>
        <legend>Hint</legend>
        <RichTextWidget id="hint" value={hint} onBlur={textWidgetBlur}/>
      </fieldset>
    </div>
  );
};
