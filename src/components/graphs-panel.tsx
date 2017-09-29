import * as React from "react";
import { SensorConfiguration } from "../models/sensor-configuration";
import SensorGraph from "./sensor-graph";
import { SensorSlot } from "../models/sensor-slot";
import sizeMe from "react-sizeme";

interface ISizeMeSize {
  width:number|null;
  height:number|null;
}

interface IGraphsPanelProps {
  size:ISizeMeSize;
  sensorConnector:any;
  sensorConfig:SensorConfiguration|null;
  sensorSlots:SensorSlot[];
  secondGraph:boolean;
  onGraphZoom:(xStart:number, xEnd:number) => void;
  onSensorSelect:(sensorIndex:number, columnID:string) => void;
  onZeroSensor:(sensorSlot:SensorSlot, sensorValue:number) => void;
  onStopCollection:() => void;
  xStart:number;
  xEnd:number;
  timeUnit:string;
  runLength:number;
  collecting:boolean;
  hasData:boolean;
  dataReset:boolean;
}

const GraphsPanelImp: React.SFC<IGraphsPanelProps> = (props) => {
  
  function renderGraph( sensorSlot:SensorSlot,
                        title:string,
                        isSingletonGraph:boolean,
                        isLastGraph:boolean = isSingletonGraph) { 

    const sensorColumns = (props.sensorConfig && props.sensorConfig.dataColumns) || [],
          availableHeight = props.size.height && (props.size.height - 20),
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
                        sensorConnector={props.sensorConnector}
                        sensorColumns={sensorColumns}
                        sensorSlot={sensorSlot}
                        title={title}
                        isSingletonGraph={isSingletonGraph}
                        isLastGraph={isLastGraph}
                        onGraphZoom={props.onGraphZoom} 
                        onSensorSelect={props.onSensorSelect}
                        onZeroSensor={props.onZeroSensor}
                        onStopCollection={props.onStopCollection}
                        xStart={props.xStart}
                        xEnd={props.xEnd}
                        timeUnit={props.timeUnit}
                        runLength={props.runLength}
                        collecting={props.collecting}
                        hasData={props.hasData}
                        dataReset={props.dataReset}/>;
  }

  const { sensorSlots, secondGraph } = props,
        classes = `graphs-panel ${secondGraph ? 'two-graphs' : ''}`,
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
