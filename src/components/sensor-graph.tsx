import * as React from "react";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";
import { Graph } from "./graph";
import { SensorConfigColumnInfo } from "@concord-consortium/sensor-connector-interface";

const kSidePanelWidth = 20;

interface SensorGraphProps {
    width:number|null;
    height:number|null;
    sensorColumns:SensorConfigColumnInfo[];
    sensorSlot:SensorSlot;
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
}

interface SensorGraphState {
    sensorColID?:string;
    sensorUnit?:string;
    yMin?:number|null;
    yMax?:number|null;
}

export default class SensorGraph extends React.Component<SensorGraphProps, SensorGraphState> {

    sensor:Sensor;
    lastDataIndex:number = 0;

    constructor(props:SensorGraphProps) {
        super(props);

        this.state = {
            sensorColID: undefined
        };
    }

    handleRescale = (xRange:number[], yRange:number[]) => {
        const { sensorSlot } = this.props,
              { yMin, yMax } = this.state,
              sensor = sensorSlot && sensorSlot.sensor,
              sensorUnit = sensor && sensor.valueUnit;
        if (yMin !== yRange[0] || yMax !== yRange[1]) {
            this.setState({ sensorUnit, yMin: yRange[0], yMax: yRange[1] });
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
            const { sensorUnit } = this.state,
                  nextSensor = nextProps.sensorSlot && nextProps.sensorSlot.sensor,
                  nextSensorUnit = nextSensor && nextSensor.valueUnit;
            if (sensorUnit !== nextSensorUnit) {
                this.setState({ yMin: null, yMax: null });
            }
        }
    }

    xLabel() {
        const { isLastGraph, timeUnit } = this.props;
        return isLastGraph ? `Time (${timeUnit})` : "";
    }

    yLabel() {
        const { sensorSlot } = this.props,
        // label the data (if any) or the current sensor (if no data)
        sensor = sensorSlot.dataSensor || sensorSlot.sensor,
        sensorDefinition = sensor && sensor.definition,
        measurementName = (sensorDefinition && sensorDefinition.measurementName) || "",
        valueUnit = sensor.valueUnit || "";
        return measurementName
                ? `${measurementName} (${valueUnit})`
                : "Sensor Reading (-)";
    }

    renderGraph(graphWidth:number|null) {
        const { sensor } = this.props.sensorSlot,
              { yMin, yMax } = this.state,
              sensorDefinition = sensor && sensor.definition,
              minReading = sensorDefinition && sensorDefinition.minReading,
              maxReading = sensorDefinition && sensorDefinition.maxReading,
              plotYMin = yMin != null ? yMin : (minReading != null ? minReading : 0),
              plotYMax = yMax != null ? yMax : (maxReading != null ? maxReading : 10);
        return (
            <div className="sensor-graph">
              <Graph
                title={this.props.title}
                width={graphWidth}
                height={this.props.height}
                data={this.props.sensorSlot.sensorData}
                onRescale={this.handleRescale}
                xMin={this.props.xStart}
                xMax={this.props.xEnd}
                yMin={plotYMin}
                yMax={plotYMax}
                valuePrecision={sensor ? sensor.sensorPrecision() : 2}
                xLabel={this.xLabel()}
                yLabel={this.yLabel()} />
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
