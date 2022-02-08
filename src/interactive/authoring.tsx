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

  const updateAuthoredState = (update: Partial<IAuthoredState>) => {
    setAuthoredState({
      useFakeSensor,
      singleReads,
      ...update,
    });
  }

  const handleFakeSensor = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({useFakeSensor: e.target.checked});
  const handlesingleReads = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({singleReads: e.target.checked});

  const updateAuthoredState = (newState: Partial<IAuthoredState>) => {
    console.log(newState);
    setAuthoredState( prev => {
      if(prev) {
        return {
          ...prev,
          ...newState
        }
      }
      return {...defaultAuthoredState, ...newState};
    });
  };

  console.log("prompt", prompt);
  console.log("hint", hint);

  const handlePrompt = (nextValue: string) => updateAuthoredState({prompt: nextValue});
  const handleHint = (nextValue: string) => updateAuthoredState({hint: nextValue});
  const update = (id: string, value: string) => {
    if(id === "prompt") { updateAuthoredState({prompt: value}); }
    if(id === "hint") { updateAuthoredState({hint: value}); }
    console.log(value);
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
        <legend>Prompt</legend>
        <RichTextWidget id="prompt" value={prompt} onChange={handlePrompt} onBlur={update} onFocus={update}/>
      </fieldset>
      <fieldset>
        <legend>Hint</legend>
        <RichTextWidget id="hint" value={hint} onChange={handleHint} onBlur={update} onFocus={update}/>
      </fieldset>
    </div>
  );
};
