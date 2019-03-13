import * as React from "react";
import Button from "./smart-highlight-button";
import Select from "./smart-highlight-select";

interface IControlPanelProps {
  isConnectorAwake:boolean;
  interfaceType:string;
  sensorCount:number;
  collecting:boolean;
  hasData:boolean;
  dataChanged:boolean;
  duration:number;
  durationUnit:string;
  durationOptions:number[];
  embedInCodapUrl:string|null;
  onDurationChange:(duration:number) => void;
  onStartConnecting: () => void;
  onStartCollecting: () => void;
  onStopCollecting: () => void;
  onNewRun: () => void;
  onSaveData: () => void;
  onReloadPage: () => void;
  onAboutClick: () => void;
}

export const ControlPanel: React.SFC<IControlPanelProps> = (props) => {
  const disableStartConnecting = props.isConnectorAwake,
        disableStartCollecting = (props.isConnectorAwake && !props.interfaceType) ||
                                  (props.sensorCount === 0) || props.collecting || props.hasData,
        disableStopCollecting = !props.collecting,
        disableSendData = !(props.hasData && props.dataChanged) || props.collecting,
        disableNewData = !props.hasData || props.collecting,
        durationOptions = (props.durationOptions || []).map((d) => {
                            const dNum = d < 60 ? d : d / 60,
                                  dUnit = d < 60 ? 's' : 'm',
                                  dFormatted = `${dNum.toFixed(0)} ${dUnit}`;
                            return <option key={d} value={d}>{dFormatted}</option>;
                          }),
        startConnectingButton = (
          <Button className="startConnection control-panel-button"
                  style={{ width: 180 }}
                  onClick={props.onStartConnecting} disabled={disableStartConnecting}>
            Launch SensorConnector
          </Button>
        ),
        startCollectingButton = (
          <Button className="startSensor control-panel-button"
                  onClick={props.onStartCollecting} disabled={disableStartCollecting}>
            Start
          </Button>
        );

  function handleDurationChange(evt:React.FormEvent<HTMLSelectElement>) {
    if (props.onDurationChange)
      props.onDurationChange(Number(evt.currentTarget.value));
  }

  return (
    <div className="control-panel">

      <div className="left-controls">
        <div>
          <a onClick={props.onReloadPage}
              className="reload-page-button"
              title="Reload All">
              <i className="fa fa-repeat fa-2x"></i>
          </a>
        </div>
      </div>

      <span className="duration-label">Duration:</span>
      <Select className="duration-select control-panel-select"
              onChange={handleDurationChange} value={String(props.duration)}>
        {[durationOptions]}
      </Select>
      {props.isConnectorAwake ? startCollectingButton : startConnectingButton}
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
          <a onClick={props.onAboutClick}
              className="about-button"
              title="About">
              <div className="about-icon" />
          </a>
        </div>
      </div>
    </div>
  );
};
