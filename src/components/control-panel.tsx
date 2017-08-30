import * as React from "react";

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

  function renderEmbedInCodapUrl(url) {
    if (!url) return null;
    return (
      <a className="embed-codap-link" href={url}>Embed in CODAP</a>
    );
  }

  return (
    <div className="control-panel">
      <div className="cc-logo" />
      <span className="duration-label">Duration:</span>
      <select className="duration-select control-panel-select"
              onChange={handleDurationChange} defaultValue={String(props.duration)}>
        {[durationOptions]}
      </select>
      <button className="startSensor control-panel-button" 
        onClick={props.onStartCollecting}
        disabled={disableStartCollecting}>Start</button>
      <button className="stopSensor control-panel-button" 
        onClick={this.stopSensor}
        disabled={disableStopCollecting}>Stop</button>
      <button className="newData control-panel-button" 
        onClick={this.checkNewData} 
        disabled={disableNewData}>New Run</button>
      <button className="sendData control-panel-button" 
        onClick={this.sendData} 
        disabled={disableSendData}>Save Data</button>
      <div className="right-controls">
        <button className="reload-page control-panel-button"
                onClick={props.onReloadPage}>Reload</button>
        {renderEmbedInCodapUrl(props.embedInCodapUrl)}
      </div>
    </div>
  );
};
