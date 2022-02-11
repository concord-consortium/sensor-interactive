import * as React from "react";
import SensorGraph from "./sensor-graph";
import { withSize }  from "react-sizeme";
import { SensorRecording } from "../interactive/types";

interface ISizeMeSize {
  width:number|null;
  height:number|null;
}

interface IGraphsPanelProps {
  size:ISizeMeSize;
  sensorRecordings:SensorRecording[];
  onGraphZoom:(xStart:number, xEnd:number) => void;
  onSensorSelect:(sensorIndex:number, columnID:string) => void;
  xStart:number;
  xEnd:number;
  timeUnit:string;
  collecting:boolean;
  hasData:boolean;
  dataReset:boolean;
  hasConnected:boolean;
  assetsPath: string;
  maxHeight?: number;
  singleReads?: boolean;
}

const GraphsPanelImp: React.FC<IGraphsPanelProps> = (props) => {

  function renderGraph(options: {sensorRecording?:SensorRecording, title:string, isSingletonGraph:boolean, isLastGraph:boolean}) {
    const {sensorRecording, title, isSingletonGraph, isLastGraph} = options,
          height = props.maxHeight || props.size.height,
          availableHeight = height && (height - 20),
          singleGraphHeight = availableHeight && (availableHeight + 8),
          graphBaseHeight = availableHeight && Math.floor((availableHeight - 18) / 2),
          firstGraphHeight = graphBaseHeight,
          secondGraphHeight = availableHeight && graphBaseHeight && (availableHeight - graphBaseHeight),
          graphWidth = props.size.width && (props.size.width - 16),
          graphHeight = isSingletonGraph
                          ? singleGraphHeight
                          : isLastGraph ? secondGraphHeight : firstGraphHeight;
    return <SensorGraph width={graphWidth}
                        height={graphHeight}
                        sensorRecording={sensorRecording}
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
                        />;
  }

  const { sensorRecordings, hasConnected } = props,
        secondGraph = sensorRecordings.length > 1,
        classes = `graphs-panel ${secondGraph ? 'two-graphs' : ''} ${hasConnected ? '' : 'disabled'}`,
        style = { minHeight: secondGraph ? 320 : 170 };

  return (
      <div className={classes} style={style}>
        {renderGraph({sensorRecording: sensorRecordings[0], title: "graph1", isSingletonGraph: !secondGraph, isLastGraph: !secondGraph})}
        {secondGraph
            ? renderGraph({sensorRecording: sensorRecordings[1], title: "graph2", isSingletonGraph: false, isLastGraph: true})
            : null}
      </div>
    );
};

const sizeMeConfig = {
  monitorWidth: true,
  monitorHeight: true,
  noPlaceholder: true
};

const GraphsPanel = withSize(sizeMeConfig)(GraphsPanelImp);

export default GraphsPanel;
