import * as React from "react";
import SensorGraph from "./sensor-graph";
import { SensorRecording } from "../interactive/types";
import { PredictionState } from "./types";
interface IGraphsPanelProps {
  sensorRecordings:SensorRecording[];
  preRecordings:SensorRecording[];
  predictionState: PredictionState;
  prediction: number[][];
  setPredictionF: (prediction:number[][]) => void;
  onGraphZoom:(xStart:number, xEnd:number) => void;
  onSensorSelect:(sensorIndex:number, columnID:string) => void;
  xStart:number;
  xEnd:number;
  timeUnit:string;
  collecting:boolean;
  hasData:boolean;
  dataReset:boolean;
  assetsPath: string;
  secondGraph:boolean;
  maxHeight: number;
  width: number;
  singleReads?: boolean;
  sensorUnit?: string|null;
  usePrediction:boolean|undefined;
  displayType: string;
}

export const GraphsPanel: React.FC<IGraphsPanelProps> = (props) => {

  function renderGraph(options: {
    sensorRecording?:SensorRecording,
    preRecording?: SensorRecording,
    title:string,
    isSingletonGraph:boolean,
    isLastGraph:boolean}) {
    const {sensorRecording, preRecording, title, isSingletonGraph, isLastGraph} = options,
          availableHeight = props.maxHeight - 36,
          singleGraphHeight = availableHeight + 8,
          graphBaseHeight = Math.floor((availableHeight - 18) / 2),
          firstGraphHeight = graphBaseHeight,
          secondGraphHeight = availableHeight - graphBaseHeight,
          graphWidth = props.width - 16,
          graphHeight = isSingletonGraph
                          ? singleGraphHeight
                          : isLastGraph ? secondGraphHeight : firstGraphHeight;
    return <SensorGraph width={graphWidth}
                        height={graphHeight}
                        sensorRecording={sensorRecording}
                        preRecording={preRecording}
                        title={title}
                        isSingletonGraph={isSingletonGraph}
                        isLastGraph={isLastGraph}
                        onGraphZoom={props.onGraphZoom}
                        onSensorSelect={props.onSensorSelect}
                        xStart={props.xStart}
                        xEnd={props.xEnd}
                        timeUnit={props.timeUnit}
                        collecting={props.collecting}
                        hasData={props.hasData}
                        dataReset={props.dataReset}
                        assetsPath={props.assetsPath}
                        singleReads={props.singleReads}
                        predictionState={props.predictionState}
                        prediction={props.prediction}
                        setPredictionF={props.setPredictionF}
                        sensorUnit={props.sensorUnit}
                        usePrediction={props.usePrediction}
                        displayType={props.displayType}
            />;

  }

  const { sensorRecordings, preRecordings, secondGraph, predictionState, hasData } = props;
  const hasConnected = sensorRecordings.length > 0;
  const showSecondGraph = secondGraph || (sensorRecordings.length > 1);

  // The logic of when to "disable" the graph:
  // - We don't disable it if we have connected to sensors.
  // - We don't disable it if we are in the middle of prediction
  // - We dont disable it if we have data
  // - We don't disable it if we are displaying read-only data from the author.
  const disabled = !(
    hasConnected
    || predictionState == 'started'
    || predictionState == 'completed'
    || hasData
    || preRecordings.length > 0
  );
  const classes = `graphs-panel ${showSecondGraph ? 'two-graphs' : ''} ${disabled ? 'disabled' : ''}`;
  const style = { minHeight: showSecondGraph ? 320 : 170 };

  return (
      <div className={classes} style={style}>
        {renderGraph({sensorRecording: sensorRecordings[0], preRecording: preRecordings && preRecordings[0], title: "graph1", isSingletonGraph: !showSecondGraph, isLastGraph: !showSecondGraph})}
        {showSecondGraph
            ? renderGraph({sensorRecording: sensorRecordings[1], title: "graph2", isSingletonGraph: false, isLastGraph: true})
            : null}
      </div>
    );
};

export default GraphsPanel;
