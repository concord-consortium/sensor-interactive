import * as React from "react";
import { SensorRecording } from "../interactive/types";
import { Sensor } from "../models/sensor";
import { Graph } from "./graph";

const kSidePanelWidth = 20;

interface SensorGraphProps {
    width:number|null;
    height:number|null;
    sensorRecording?:SensorRecording;
    title:string;
    onGraphZoom:(xStart:number, xEnd:number) => void;
    onSensorSelect:(sensorIndex:number, columnID:string) => void;
    collecting:boolean;
    hasData:boolean;
    dataReset:boolean;
    timeUnit:string;
    xStart:number;
    xEnd:number;
    isSingletonGraph:boolean;
    isLastGraph:boolean;
    assetsPath: string;
    singleReads?: boolean;
}

interface SensorGraphState {
    yMin?:number|null;
    yMax?:number|null;
}

export default class SensorGraph extends React.Component<SensorGraphProps, SensorGraphState> {

    sensor:Sensor;
    lastDataIndex:number = 0;

    constructor(props:SensorGraphProps) {
        super(props);
        this.state = {};
    }

    handleRescale = (xRange:number[], yRange:number[]) => {
        const { yMin, yMax } = this.state;
        if (yMin !== yRange[0] || yMax !== yRange[1]) {
            this.setState({ yMin: yRange[0], yMax: yRange[1] });
        }
        if (this.props.onGraphZoom) {
            this.props.onGraphZoom(xRange[0], xRange[1]);
        }
    }

    componentWillReceiveProps(nextProps:SensorGraphProps) {
        const { dataReset } = this.props;
        if (!dataReset && nextProps.dataReset) {
            this.lastDataIndex = 0;

            // if sensor type changes, revert to default axis range for sensor
            const { sensorRecording } = this.props,
                  nextSensorRecording = nextProps.sensorRecording;
            if (sensorRecording?.unit !== nextSensorRecording?.unit) {
                this.setState({ yMin: null, yMax: null });
            }
        }
    }

    xLabel() {
        const { isLastGraph, timeUnit } = this.props;
        return isLastGraph ? `Time (${timeUnit})` : "";
    }

    yLabel() {
        const { sensorRecording } = this.props;
        // label the data (if any) or the current sensor (if no data)
        return sensorRecording?.name
                ? `${sensorRecording.name} (${sensorRecording.unit})`
                : "Sensor Reading (-)";
    }

    renderGraph(graphWidth:number|null) {
        const { sensorRecording } = this.props,
              { yMin, yMax } = this.state,
              plotYMin = yMin != null ? yMin : (sensorRecording?.min != null ? sensorRecording.min : 0),
              plotYMax = yMax != null ? yMax : (sensorRecording?.max != null ? sensorRecording.max : 10);
        return (
            <div className="sensor-graph">
              <Graph
                title={this.props.title}
                width={graphWidth}
                height={this.props.height}
                data={sensorRecording?.data || []}
                onRescale={this.handleRescale}
                xMin={this.props.xStart}
                xMax={this.props.xEnd}
                yMin={plotYMin}
                yMax={plotYMax}
                valuePrecision={sensorRecording?.precision || 2}    // TODO: figure out default precision
                xLabel={this.xLabel()}
                yLabel={this.yLabel()}
                assetsPath={this.props.assetsPath}
                singleReads={this.props.singleReads}
              />
            </div>
        );
    }

    render() {
        const graphWidth = this.props.width && (this.props.width - kSidePanelWidth);
        return (
            <div className="sensor-graph-panel">
                {this.renderGraph(graphWidth)}
            </div>
        );
    }
}
