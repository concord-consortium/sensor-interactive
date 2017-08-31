import * as React from "react";
import Button from "./smart-highlight-button";
import Select from "./smart-highlight-select";

interface IControlPanelProps {
  sensorType:string;
  collecting:boolean;
  hasData:boolean;
  dataChanged:boolean;
  duration:number;
  durationUnit:string;
  durationOptions:number[];
  embedInCodapUrl:string|null;
  onDurationChange:(duration:number) => void;
  onStartCollecting: () => void;
  onStopCollecting: () => void;
  onNewRun: () => void;
  onSaveData: () => void;
  onReloadPage: () => void;
}

export const ControlPanel: React.SFC<IControlPanelProps> = (props) => {
  const disableStartCollecting = !props.sensorType ||props.collecting || props.hasData,
        disableStopCollecting = !props.collecting,
        disableSendData = !(props.hasData && props.dataChanged) || props.collecting,
        disableNewData = !props.hasData || props.collecting,
        durationOptions = (props.durationOptions || []).map((d) => {
                            const dStr = String(d),
                                  dFormatted = d.toFixed(1) + props.durationUnit;
                            return <option key={dStr} value={dStr}>{dFormatted}</option>;
                          });
  
  function handleDurationChange(evt:React.FormEvent<HTMLSelectElement>) {
    if (props.onDurationChange)
      props.onDurationChange(Number(evt.currentTarget.value));
  }

  function renderEmbedInCodapUrl(url:string|null) {
    if (!url) return null;
    return (
      <a className="embed-codap-link" href={url}>Embed in CODAP</a>
    );
  }

  return (
    <div className="control-panel">
      <div className="cc-logo" />
      <span className="duration-label">Duration:</span>
      <Select className="duration-select control-panel-select"
              onChange={handleDurationChange} defaultValue={String(props.duration)}>
        {[durationOptions]}
      </Select>
      <Button className="startSensor control-panel-button"
              onClick={props.onStartCollecting} disabled={disableStartCollecting}>
        Start
      </Button>
      <Button className="stopSensor control-panel-button"
              onClick={props.onStopCollecting} disabled={disableStopCollecting}>
        Stop
      </Button>
      <Button className="sendData control-panel-button"
              onClick={props.onSaveData} disabled={disableSendData}>
        Save Data
      </Button>
      <Button className="newData control-panel-button"
              onClick={props.onNewRun} disabled={disableNewData}>
        New Run
      </Button>
      <div className="right-controls">
        <div>
          <a onClick={props.onReloadPage}
              className="reload-page-button"
              title="Reload page">
              <i className="fa fa-repeat fa-2x"></i>
          </a>
        </div>
        {renderEmbedInCodapUrl(props.embedInCodapUrl)}
      </div>
    </div>
  );
};
