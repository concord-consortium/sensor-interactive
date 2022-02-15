import * as React from "react";
import { IAuthoringInitInteractive, useAuthoredState } from "@concord-consortium/lara-interactive-api";
import { RichTextWidget } from "../components/rich-text-widget";
import { defaultAuthoredState, IAuthoredState, SensorRecording } from "./types";
import { SensorDefinitions } from "../models/sensor-definitions";

import "./authoring.css";

interface Props {
  initMessage: IAuthoringInitInteractive<IAuthoredState>;
}

export const AuthoringComponent: React.FC<Props> = ({initMessage}) => {
  const {authoredState, setAuthoredState} = useAuthoredState<IAuthoredState>();
  const { singleReads, useFakeSensor, prompt, hint, sensorUnit, recordedData } = authoredState || defaultAuthoredState;

  const handlesingleReads = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({singleReads: e.target.checked});

  const updateAuthoredState = (newState: Partial<IAuthoredState>) => {
    setAuthoredState( prev => {
      const newValue = {...(prev || defaultAuthoredState), ...newState};
      return newValue;
    });
  };

  const handleFakeSensor = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthoredState({useFakeSensor: e.target.checked, sensorUnit: ''});
  };


  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAuthoredState({sensorUnit: e.target.value});
  };


  const handleRecordedDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if(authoredState?.sensorUnit) {
      let data = [] as number[][];
      let rows = [];
      try {
        rows = value.split('\n');
        for (let row of rows) {
          data.push(row.split(/,/g).map(d => parseFloat(d)));
        }
      }
      catch (e) {
        console.error('cant parse data', e);
      }

      const unit = authoredState.sensorUnit as string;
      const definition = SensorDefinitions[unit];
      const precision = 2;
      const columnID = "110";   // TODO: ??
      const sensorPosition = 0; // TODO: ??
      const tareValue = 0;
      const a: SensorRecording = {
        data,
        precision,
        columnID,
        sensorPosition,
        tareValue,
        unit,
        min: definition.maxReading,
        max: definition.minReading,
        name: definition.measurementName,
      };
      updateAuthoredState({recordedData: a});
    }
  };

  const displayConfig = () => {
    const unit = authoredState?.sensorUnit as string;
    const definition = SensorDefinitions[unit];
    if(definition) {
      return (
        <fieldset>
          <legend>Graph Config</legend>
            <dl>
              <dt>Unit:</dt>
                <dd>{unit}</dd>
              <dt>Measurement Name:</dt>
                <dd>{definition.measurementName}</dd>
              <dt>Sensor Name:</dt>
                <dd>{definition.sensorName}</dd>
              <dt>Max:</dt>
                <dd>{definition.maxReading}</dd>
              <dt>Min:</dt>
                <dd>{definition.minReading}</dd>
            </dl>
        </fieldset>
      )
    }
  }

  const textWidgetBlur = (id: string, value: string) => {
    if(id === "prompt") { updateAuthoredState({prompt: value}); }
    if(id === "hint") { updateAuthoredState({hint: value}); }
  }

  const unitSelectOptions = () =>{
    let units = [''];
    if(useFakeSensor == true) {
      units = units.concat(['m','degC']);
    } else {
      units = units.concat(Object.keys(SensorDefinitions));
    }
    return units.map(unit => {
      return {
        unit,
        name: unit === '' ? 'Any' : SensorDefinitions[unit].measurementName
      }
    });
  };

  const options = unitSelectOptions().map(option => {
    return(
      <option value={option.unit}>
        {option.name} { option.unit != '' ? `(${option.unit})` : ''}
      </option>
    );
  });

  const renderPrerecordedText = () => {
    if(sensorUnit) {
      return (
        <fieldset>
          <legend>Data</legend>
            <textarea name="recordedData" onChange={handleRecordedDataChange}>
              {recordedData && recordedData.data?.map(row => row.join(',')).join('\n')}
          </textarea>
        </fieldset>
      );
    }
  }

  return (
    <div className="authoring">
      <fieldset>
        <legend>Prompt</legend>
        <RichTextWidget id="prompt" value={prompt} onBlur={textWidgetBlur}/>
      </fieldset>

      <fieldset>
        <legend>Hint</legend>
        <RichTextWidget id="hint" value={hint} onBlur={textWidgetBlur}/>
      </fieldset>

      <fieldset>
        <legend>Sensor Types</legend>
        <select value={sensorUnit} onChange={handleUnitChange}>
          {options}
        </select>
        <br/>
        <input type="checkbox" checked={useFakeSensor} onChange={handleFakeSensor} /> Use fake sensor
      </fieldset>
      <fieldset>
        <legend>Data Acquisition</legend>
        <input type="checkbox" checked={singleReads} onChange={handlesingleReads} /> Single reads
      </fieldset>
      { displayConfig() }
      { renderPrerecordedText() }
    </div>
  );
};
