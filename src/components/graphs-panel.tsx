import * as React from "react";
import { SensorConfiguration } from "../models/sensor-configuration";
import SensorGraph from "./sensor-graph";
import { SensorSlot } from "../models/sensor-slot";
import sizeMe = require("react-sizeme");

interface ISizeMeSize {
  width:number|null;
  height:number|null;
}

interface IGraphsPanelProps {
  size:ISizeMeSize;
  sensorConfig:SensorConfiguration|null;
  sensorSlots:SensorSlot[];
  secondGraph:boolean;
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
}

const GraphsPanelImp: React.SFC<IGraphsPanelProps> = (props) => {

  function renderGraph( sensorSlot:SensorSlot,
                        title:string,
                        isSingletonGraph:boolean,
                        isLastGraph:boolean = isSingletonGraph) {
    const sensorColumns = (props.sensorConfig && props.sensorConfig.dataColumns) || [],
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
                        sensorColumns={sensorColumns}
                        sensorSlot={sensorSlot}
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
                        assetsPath={props.assetsPath}/>;
  }

  const { sensorSlots, secondGraph, hasConnected } = props,
        classes = `graphs-panel ${secondGraph ? 'two-graphs' : ''} ${hasConnected ? '' : 'disabled'}`,
        style = { minHeight: secondGraph ? 320 : 170 };

  return (
      <div className={classes} style={style}>
        {renderGraph(sensorSlots && sensorSlots[0], "graph1", !secondGraph)}
        {secondGraph
            ? renderGraph(sensorSlots && sensorSlots[1], "graph2", false, true)
            : null}
      </div>
    );
};

const sizeMeConfig = {
  monitorWidth: true,
  monitorHeight: true,
  noPlaceholder: true
};
const GraphsPanel = sizeMe(sizeMeConfig)(GraphsPanelImp);
export default GraphsPanel;
