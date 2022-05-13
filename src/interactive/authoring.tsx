import * as React from "react";
import { IAuthoringInitInteractive, useAuthoredState } from "@concord-consortium/lara-interactive-api";
import { RichTextWidget } from "../components/rich-text-widget";
import { defaultAuthoredState, IAuthoredState, SensorRecording } from "./types";
import { SensorDefinitions } from "../models/sensor-definitions";

import "./authoring.css";
import { InfoIcon } from "../components/info-icon";

interface Props {
  initMessage: IAuthoringInitInteractive<IAuthoredState>;
}

export const AuthoringComponent: React.FC<Props> = ({initMessage}) => {
  const {authoredState, setAuthoredState} = useAuthoredState<IAuthoredState>();
  const {
    singleReads, enablePause, useFakeSensor, prompt, hint, sensorUnit,
    recordedData, usePrediction, useAuthoredData, useSensors,
  } = authoredState || defaultAuthoredState;

  const [parseError, setParseError] = React.useState<boolean>(false);

  const handlesingleReads = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({singleReads: e.target.checked});

  const handleEnablePause = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({enablePause: e.target.checked});

  // When we unset prediction, we may need to erase units/min/max
  const handleUsePrediction = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextUsePrediction = e.target.checked;
    const changes: Partial<IAuthoredState>  = {usePrediction: nextUsePrediction};
    updateAuthoredState(changes);
  }

  // When we unset authoredData, we may need to erase units/min/max
  const handleUseAuthoredData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextAuthoredData = e.target.checked;
    const changes: Partial<IAuthoredState>  = {useAuthoredData: nextAuthoredData};
    updateAuthoredState(changes);
  }

  const updateAuthoredState = (newState: Partial<IAuthoredState>) => {
    setAuthoredState( prev => {
      const newValue = {...(prev || defaultAuthoredState), ...newState};
      return newValue;
    });
  };

  const handleFakeSensor = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthoredState({useFakeSensor: e.target.checked, sensorUnit: ''});
  };

  const handleUseSensors = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthoredState({useSensors: e.target.checked, sensorUnit: ''});
  };


  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value;
    const definition = SensorDefinitions[unit];
    const {minReading: min, maxReading: max, measurementName: name} = definition;

    const changes: Partial<IAuthoredState>  = {sensorUnit: unit};
    if (recordedData) {
      changes.recordedData = {...recordedData, min, max, name, unit};
    }

    updateAuthoredState(changes);
  };


  const handleRecordedDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setParseError(false);

    if(authoredState?.sensorUnit) {
      let data = [] as number[][];
      let min = Number.MAX_SAFE_INTEGER;
      let max = Number.MIN_SAFE_INTEGER;
      let rows = [];
      const unit = authoredState.sensorUnit as string;
      const definition = SensorDefinitions[unit];
      min = definition.minReading;
      max = definition.maxReading;

      rows = value.split('\n');
      for (let row of rows) {
        let cols = row.split(',');
        let [x, y] = cols.map(Number);
        if(cols.length == 2) {
          if(isNaN(x) || isNaN(y) || x === undefined || y === undefined) {
            console.error('cant parse data', e);
            setParseError(true)
          }
          else {
            data.push([x, y]);
            min = Math.min(min, y);
            max = Math.max(max, y);
          }
        }
      }

      const precision = 2;
      const columnID = "110";
      const sensorPosition = 0;
      const tareValue = 0;
      const a: SensorRecording = {
        data,
        precision,
        columnID,
        sensorPosition,
        tareValue,
        unit,
        min: min,
        max: max,
        name: definition.measurementName,
      };
      updateAuthoredState({recordedData: a});
    }
  };
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

  const disableUnits = !(usePrediction || useAuthoredData);
  const unitOptionTags = disableUnits
   ? [
        <option
          key="none"
          value="none"
          disabled={true}>
          none
        </option>
      ]
   : unitSelectOptions().map(option => {
      return(
        <option value={option.unit} key={option.unit}>
          {option.name} { option.unit != '' ? `(${option.unit})` : ''}
        </option>
      );
   });

  const renderErrorParseError = () => {
    if(parseError) {
      return (
        <div className="parse-error">
          <p>Unable to parse CSV data.</p>
          <p>Please check that the data is comma separated and contains only numbers.</p>
          <p>Each row should be newline terminated</p>
        </div>
      )
    }
  }

  const renderPrerecordedText = () => {
    if(sensorUnit) {
      const data = recordedData && recordedData.data?.map(row => row.join(',')).join('\n');
      return (
        <fieldset>
          <legend>Preload Data</legend>
            <div className={
                useAuthoredData
                ? "prerecorded-text"
                : "prerecord-text disabled"}
              >
              <textarea
                name="recordedData"
                onChange={handleRecordedDataChange}
                disabled={!useAuthoredData}
                defaultValue={useAuthoredData ? data : "x1,y1\nx2,y2"}/>
              {renderErrorParseError()}
            </div>
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
        <legend>Data Acquisition and Display type(s)</legend>
        <select value="Line Graphs">
          <option value="Line Graphs">Line Graphs</option>
          <option value="Bar Graphs">Bar Graphs</option>
          <option value="Tables (TBD)">Tables (TBD)</option>
        </select>
        <br/>

        <input
          type="checkbox"
          checked={useSensors}
          onChange={handleUseSensors}/>
          Acquire Data with Sensors
        <br/>

        <input
          type="checkbox"
          checked={useFakeSensor}
          onChange={handleFakeSensor}/>
          Use fake sensor
        <br/>

        <input
          type="checkbox"
          checked={singleReads}
          onChange={handlesingleReads}/>
          Individual Data Acquisition on Demand
        <br/>

        <input
          type="checkbox"
          checked={enablePause}
          onChange={handleEnablePause}/>
          Enable Pause
        <br/>

      </fieldset>
      <fieldset>
        <legend>Preloaded and Predicted Data</legend>
        <div className="info">
          <InfoIcon size={16} color="black" />&nbsp;
          Preloaded/Predicted data requires a specific
          quantity and unit to be selected for the y axis.
        </div>
        <br/>

        <input
          type="checkbox"
          checked={useAuthoredData}
          onChange={handleUseAuthoredData}/>
          Preload Data
        <br/>

        <input
          type="checkbox"
          checked={usePrediction}
          onChange={handleUsePrediction}/>
          Predict Data
        <br/>

        <div className={
          (usePrediction || useAuthoredData)
          ? "sensor-select-section"
          : "sensor-select-section disabled"}>
          <label>
            Y Axis/Column and Sensor
          </label><br/>
          <select
            value={disableUnits ? "none" : sensorUnit}
            onChange={handleUnitChange}>
            disabled={!(useAuthoredData || usePrediction)}
            {unitOptionTags}
          </select>
        </div>
        <br/>

      </fieldset>
      { renderPrerecordedText() }
    </div>
  );
};
