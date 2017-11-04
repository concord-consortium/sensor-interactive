import * as React from "react";
import { Sensor } from "../models/sensor";
import { SensorSlot } from "../models/sensor-slot";
import { Graph } from "./graph";
import { GraphSidePanel } from "./graph-side-panel";
import { ISensorConfigColumnInfo } from "../models/sensor-connector-interface";
import { Format } from "../utils/format";
         
const kSidePanelWidth = 200;

interface SensorGraphProps {
    width:number|null;
    height:number|null;
    sensorColumns:ISensorConfigColumnInfo[];
    sensorSlot:SensorSlot;
    title:string;
    onGraphZoom:(xStart:number, xEnd:number) => void;
    onSensorSelect:(sensorIndex:number, columnID:string) => void;
    onZeroSensor:(sensorSlot:SensorSlot, sensorValue:number) => void;
    onStopCollection:() => void;
    runLength:number;
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
    sensorValue:number|undefined;
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
            sensorColID: undefined,
            sensorValue: undefined
        };
    }

    sensorPrecision() {
        const { sensorSlot } = this.props,
              sensor = sensorSlot && sensorSlot.sensor,
              sensorDefinition = sensor && sensor.definition;
        if (!sensorDefinition)
            return 2;

        const sensorRange = sensorDefinition.maxReading - sensorDefinition.minReading,
              sensorPrecision = Format.getFixValue(sensorRange);
        return sensorPrecision;
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
    
    zeroSensor = () => {
        if (this.props.onZeroSensor) {
            this.props.onZeroSensor(this.props.sensorSlot, this.state.sensorValue || 0);
        }
    }

    componentWillReceiveProps(nextProps:SensorGraphProps) {
        const { dataReset } = this.props;
        if(!dataReset && nextProps.dataReset) {
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
                valuePrecision={this.sensorPrecision()}
                xLabel={this.xLabel()}
                yLabel={this.yLabel()} />
            </div>
        );
    }

    renderSidePanel() {
        const { collecting, hasData } = this.props,
              onSensorSelect = !collecting && !hasData ? this.props.onSensorSelect : undefined,
              onZeroSensor = !collecting && !hasData ? this.zeroSensor : undefined;
        return (
          <GraphSidePanel
            sensorSlot={this.props.sensorSlot}
            sensorColumns={this.props.sensorColumns}
            sensorPrecision={this.sensorPrecision()}
            onSensorSelect={onSensorSelect}
            onZeroSensor={onZeroSensor} />
        );
    }
    
    render() {
        const graphWidth = this.props.width && (this.props.width - kSidePanelWidth);
        return (
            <div className="sensor-graph-panel">
                {this.renderGraph(graphWidth)}
                {this.renderSidePanel()}
            </div>
        );
    }
}
