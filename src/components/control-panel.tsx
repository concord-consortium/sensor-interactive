import * as React from "react";
import Button from "./smart-highlight-button";
import Select from "./smart-highlight-select";
import { PredictionState } from "./types";

interface IControlPanelProps {
  isConnectorAwake: boolean;
  isDisabled: boolean;
  isStartDisabled?: boolean;
  predictionStatus: PredictionState,
  interfaceType: string;
  sensorCount: number;
  collecting: boolean;
  hasData: boolean;
  dataChanged: boolean;
  duration: number;
  durationUnit: string;
  durationOptions: number[];
  embedInCodapUrl: string|null;
  onDurationChange:(duration:number) => void;
  onStartConnecting: () => void;
  onStartCollecting: () => void;
  onStopCollecting: () => void;
  onClearPrediction: () => void;
  onSavePrediction: () => void;
  onNewRun: () => void;
  onSaveData: (() => void) | undefined;
  onReloadPage: () => void;
  onAboutClick: () => void;
  assetsPath: string;
  singleReads?: boolean;
}

export const ControlPanel: React.FC<IControlPanelProps> = (props) => {
  const { predictionStatus } = props;
  const predictionRequired =
           (predictionStatus !== "not-required")
        && (predictionStatus !== "completed");
  const showPredictionButtons =
        predictionStatus !== "not-required"
    &&  predictionStatus !== "pending";

  const disableClearPrediction = predictionStatus !== "started";
  const disableSavePrediction = predictionStatus !== "started";

  const disableStartCollecting =
      (props.isConnectorAwake && !props.interfaceType)
    ||(props.sensorCount === 0)
    || props.collecting
    || props.hasData
    || predictionRequired
    || props.isDisabled;

  const disableStopCollecting = !props.collecting;
  const disableSendData = !(props.hasData && props.dataChanged) || props.collecting;
  const disableNewData = props.isDisabled || !props.hasData || props.collecting;
  const disableDuration = props.isDisabled || props.collecting;

  const durationOptions = (props.durationOptions || []).map((d) => {
                            const dNum = d < 60 ? d : d / 60,
                                  dUnit = d < 60 ? 's' : 'm',
                                  dFormatted = `${dNum.toFixed(0)} ${dUnit}`;
                            return <option key={d} value={d}>{dFormatted}</option>;
                          });

  const disableRecord = props.isDisabled || props.isStartDisabled;
  const controlPanelClass = props.isDisabled
    ? "control-panel disabled"
    : "control-panel";

  const durationLabelClass = props.isDisabled || props.collecting
    ? "duration-label disabled"
    : "duration-label";

  const {onSavePrediction, onClearPrediction} = props;

  const startCollectingButton = (
    <Button className="start-sensor control-panel-button"
            onClick={props.onStartCollecting}
            disabled={disableStartCollecting}>
      Start
    </Button>
  );

  const clearPredictionButton = (
    <Button className="start-sensor control-panel-button"
            onClick={onClearPrediction}
            disabled={disableClearPrediction}>
      Clear Prediction
    </Button>
  );

  const savePredictionButton = (
    <Button className="start-sensor control-panel-button"
            onClick={onSavePrediction}
            disabled={disableSavePrediction}>
      Save Prediction
    </Button>
  );

  function handleDurationChange(evt:React.FormEvent<HTMLSelectElement>) {
    if (props.onDurationChange)
      props.onDurationChange(Number(evt.currentTarget.value));
  }

  return (
    <div className={controlPanelClass}>

      <div className="left-controls">
        <div className="icon-container" onClick={props.onReloadPage}>
          <svg className="icon reload">
            <use xlinkHref={`${props.assetsPath}/images/icons.svg#icon-reload`} />
          </svg>
          <div className="icon-label">Reload</div>
        </div>
        {showPredictionButtons && clearPredictionButton}
        {showPredictionButtons && savePredictionButton}
      </div>

      <div className="right-controls">

        {props.singleReads ?
          <Button className="record-sensor control-panel-button"
            onClick={props.onStartCollecting}
            disabled={disableRecord}>
            Record
          </Button>
        :
          <>
            <span className={durationLabelClass}>Duration:</span>
            <Select className="duration-select control-panel-select"
                    onChange={handleDurationChange}
                    value={String(props.duration)}
                    disabled={disableDuration}>
              {[durationOptions]}
            </Select>
            {startCollectingButton}
            <Button className="stop-sensor control-panel-button"
                    onClick={props.onStopCollecting}
                    disabled={disableStopCollecting}>
              Stop
            </Button>
          </>
        }
        {props.onSaveData ?
        <Button className="send-data control-panel-button"
                onClick={props.onSaveData}
                disabled={disableSendData}>
          Save Data
        </Button> : undefined}
        <Button className="new-data control-panel-button"
                onClick={props.onNewRun}
                disabled={disableNewData}>
          New Run
        </Button>

        <div className="icon-container"
             onClick={props.onAboutClick}>
          <svg className="icon about">
            <use xlinkHref={`${props.assetsPath}/images/icons.svg#icon-lightbulb`} />
          </svg>
          <div className="icon-label">About</div>
        </div>
      </div>
    </div>
  );
};
