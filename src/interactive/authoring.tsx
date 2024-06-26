import * as React from "react";
import { IAuthoringInitInteractive, useAuthoredState } from "@concord-consortium/lara-interactive-api";
import { RichTextWidget } from "../components/rich-text-widget";
import { defaultAuthoredState, IAuthoredState, SensorRecording } from "./types";
import { SensorDefinitions } from "../models/sensor-definitions";
import { InfoIcon } from "../components/info-icon";

import "./authoring.css";

interface Props {
  initMessage: IAuthoringInitInteractive<IAuthoredState>;
}

interface IYMinMax {
  xMin: string;
  xMax: string;
  yMin: string;
  yMax: string;
}

export const AuthoringComponent: React.FC<Props> = ({initMessage}) => {
  const {authoredState, setAuthoredState} = useAuthoredState<IAuthoredState>();
  const {
    singleReads, enablePause, useFakeSensor, prompt, hint, sensorUnit,
    recordedData, usePrediction, useAuthoredData, useSensors, displayType, overrideAxes,
    authoredMinMax } = authoredState || defaultAuthoredState;
  const {authoredXMin, authoredXMax, authoredYMin, authoredYMax} = authoredMinMax || {};
  const [parseError, setParseError] = React.useState<boolean>(false);
  const [minMax, setMinMax] = React.useState<IYMinMax>({xMin: "0", xMax: "0", yMin: "0", yMax: "0"});

  React.useEffect(() => {
    const { xMin, xMax, yMin, yMax } = minMax;
    const newMinMax: IYMinMax = {...minMax};
    if (authoredXMin !== undefined && authoredXMin!== Number(xMin)) {
      newMinMax.xMin = `${authoredXMin}`;
    }
    if (authoredXMax !== undefined && authoredXMax !== Number(xMax)) {
      newMinMax.xMax = `${authoredXMax}`;
    }
    if (authoredYMin !== undefined && authoredYMin !== Number(yMin)) {
      newMinMax.yMin = `${authoredYMin}`;
    }
    if (authoredYMax !== undefined && authoredYMax !== Number(yMax)) {
      newMinMax.yMax = `${authoredYMax}`;
    }
    setMinMax(newMinMax);
  }, [authoredXMin, authoredXMax, authoredYMin, authoredYMax]);

  const handlesingleReads = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({singleReads: e.target.checked});

  const handleEnablePause = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({enablePause: e.target.checked});

  const handleOverrideAxes = (e: React.ChangeEvent<HTMLInputElement>) => updateAuthoredState({overrideAxes: e.target.checked});

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
    const changes: Partial<IAuthoredState>  = {sensorUnit: unit};
    const definition = SensorDefinitions[unit];

    if (definition && recordedData) {
      const {minReading: min, maxReading: max, measurementName: name} = definition;
      changes.recordedData = {...recordedData, min, max, name, unit};
    }

    updateAuthoredState(changes);
  };

  const handleDisplayTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const display = e.target.value;
    const changes: Partial<IAuthoredState> = {displayType: display};
    updateAuthoredState(changes);
  }


  const handleMinMaxChange = (e: React.ChangeEvent<HTMLInputElement>, minMaxKey: keyof IYMinMax) => {
    setMinMax({...minMax, [minMaxKey]: e.target.value});
  };

  const handleAuthoredAxisBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let { xMin, xMax, yMin, yMax } = minMax;

    if (e.target.id === "authoredXMin" && Number(xMin) > Number(xMax)) {
      xMin = `${Number(xMax) - .1}`;
    } else if (e.target.id === "authoredXMax" && Number(xMax) < Number(xMin)) {
      xMax = `${Number(xMin) + .1}`;
    } else if (e.target.id === "authoredYMin" && Number(yMin) > Number(yMax)) {
      yMin = `${Number(yMax) - .1}`;
    } else if (e.target.id === "authoredYMax" && Number(yMax) < Number(yMin)) {
      yMax = `${Number(yMin) + .1}`;
    }

    // round to nearest 2 decimal places
    xMin = Number(xMin).toFixed(2);
    xMax = Number(xMax).toFixed(2);
    yMin = Number(yMin).toFixed(2);
    yMax = Number(yMax).toFixed(2);

    setMinMax({ xMin, xMax, yMin: yMin, yMax: yMax });

    const changes: Partial<IAuthoredState> = {
      authoredMinMax: {
        authoredXMin: Number(xMin),
        authoredXMax: Number(xMax),
        authoredYMin: Number(yMin),
        authoredYMax: Number(yMax)
      }
    };
    updateAuthoredState(changes);
  };

  const handleAuthoredAxisKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.currentTarget.blur();
    }
  };

  const handleRecordedDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setParseError(false);

      let data = [] as number[][];
      let min = Number.MAX_SAFE_INTEGER;
      let max = Number.MIN_SAFE_INTEGER;
      let rows = [];
      const unit = authoredState?.sensorUnit || "";
      let measurementName = "";

      if (unit) {
        const definition = SensorDefinitions[unit];
        min = definition.minReading;
        max = definition.maxReading;
        measurementName = definition.measurementName;
      }

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
        sensorID: -1,
        precision,
        columnID,
        sensorPosition,
        tareValue,
        unit,
        min: min,
        max: max,
        name: measurementName,
      };
      updateAuthoredState({recordedData: a});
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

  const disableUnits = !useAuthoredData && !usePrediction && !overrideAxes;
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
    const data = recordedData && recordedData.data?.map(row => row.join(',')).join('\n');
    return (
      <div className="sub-options">
        <div className="info">
          <InfoIcon size={16} color="black" />&nbsp;
          For each data point, enter a pair of comma-separated
          values on a separate line. Data must contain only
          numbers (e.g., 1,10).
        </div>

          <textarea
            name="recordedData"
            onChange={handleRecordedDataChange}
            disabled={!useAuthoredData}
            defaultValue={data ? data : "x1,y1\nx2,y2"}/>
          {renderErrorParseError()}
      </div>
    );
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
        <legend>Authoring Options</legend>
        <br/>
        <div className="select-container">
        <div className="select-label">Display Type:</div>
        <select value={displayType} onChange={handleDisplayTypeChange}>
          <option value="line">Line Graphs</option>
          <option value="bar">Bar Graphs</option>
          {/* tables are not yet able to be implemented */}
          <option value="table" disabled>Tables (TBD)</option>
        </select>
        </div>
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
        <br/>

        <div className="info">
        <InfoIcon size={16} color="black" />&nbsp;
        The following options require that a specific quantity and unit to be selected for the y-axis.
        </div>
        <br/>

        <input
          type="checkbox"
          checked={overrideAxes}
          onChange={handleOverrideAxes}
        />
          Manually Set Graph Axes
        <br/>
        { overrideAxes &&
          <div className={"sub-options"}>
            <div className={"axis-options"}>
              <div>
                <label className={"axis-label"} htmlFor={"authoredXMin"}>X Min:</label>
                <input
                  type="number"
                  className={"axis-input"}
                  id={"authoredXMin"}
                  placeholder="0"
                  value={minMax.xMin}
                  onChange={(e) => handleMinMaxChange(e, "xMin")}
                  onKeyDown={handleAuthoredAxisKeyDown}
                  onBlur={handleAuthoredAxisBlur}
                />
                <label className={"axis-label"} htmlFor={"authoredXMax"}>X Max:</label>
                <input
                  type="number"
                  className={"axis-input"}
                  id={"authoredXMax"}
                  placeholder="0"
                  value={minMax.xMax}
                  onChange={(e) => handleMinMaxChange(e, "xMax")}
                  onKeyDown={handleAuthoredAxisKeyDown}
                  onBlur={handleAuthoredAxisBlur}
                />
              </div>
              <div>
                <label className={"axis-label"} htmlFor={"authoredYMin"}>Y Min:</label>
                <input
                  type="number"
                  className={"axis-input"}
                  id={"authoredYMin"}
                  placeholder="0"
                  value={minMax.yMin}
                  onChange={(e) => handleMinMaxChange(e, "yMin")}
                  onKeyDown={handleAuthoredAxisKeyDown}
                  onBlur={handleAuthoredAxisBlur}
                />
                <label className={"axis-label"} htmlFor={"authoredYMax"}>Y Max:</label>
                <input
                  type="number"
                  className={"axis-input"}
                  id={"authoredYMax"}
                  placeholder="0"
                  value={minMax.yMax}
                  onChange={(e) => handleMinMaxChange(e, "yMax")}
                  onKeyDown={handleAuthoredAxisKeyDown}
                  onBlur={handleAuthoredAxisBlur}
                />
              </div>
              </div>
              <div className="info">
                <b>Note:</b> the value of X Max will set the default duration of the sensor recording, regardless of the value of X Min.
                For example, if X Min is 0 and X Max is 10, the sensor will record for 10 seconds.
                If X Min is 5 and X Max is 10, the sensor will still record for 10 seconds, and values for the first 5 seconds will be not be displayed on the graph.
              </div>
              <br/>
          </div>
        }

        <input
          type="checkbox"
          checked={useAuthoredData}
          onChange={handleUseAuthoredData}/>
          Preload Data
        <br/>
        {useAuthoredData && renderPrerecordedText()}

        <input
          type="checkbox"
          checked={usePrediction}
          onChange={handleUsePrediction}/>
          Predict Data
        <br/>
        <br/>

        <div className={
          (usePrediction || useAuthoredData || overrideAxes)
          ? "select-container"
          : "select-container disabled"}>
          <div className="select-label">
            Sensor Type:
          </div>
          <select
            value={disableUnits ? "none" : sensorUnit}
            onChange={handleUnitChange}
            disabled={disableUnits}>
            {unitOptionTags}
          </select>
        </div>
      </fieldset>

    </div>
  );
};
