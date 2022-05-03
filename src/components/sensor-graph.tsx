import * as React from "react";
import { SensorRecording } from "../interactive/types";
import { Sensor } from "../models/sensor";
// import { mergeTimeSeriesData, timeSeriesData } from "../utils/merge-timeseries-data";
import { Graph } from "./graph";
import { PredictionState } from "./types";

const kSidePanelWidth = 20;

interface SensorGraphProps {
    width:number|null;
    height:number|null;
    sensorRecording?:SensorRecording;
    preRecording?:SensorRecording;
    prediction: number[][];
    predictionState: PredictionState;
    title:string;
    onGraphZoom:(xStart:number, xEnd:number) => void;
    onSensorSelect:(sensorIndex:number, columnID:string) => void;
    setPredictionF:(prediction:number[][]) => void;
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
    xMin:number;
    xMax:number;
}

export default class SensorGraph extends React.Component<SensorGraphProps, SensorGraphState> {

    sensor:Sensor;
    lastDataIndex:number = 0;

    constructor(props:SensorGraphProps) {
        super(props);
        this.state = {
            xMin: this.props.xStart,
            xMax: this.props.xEnd
        };
    }

    scaleToData() {
        const { sensorRecording, preRecording, prediction } = this.props;
        let yMin = null;
        let yMax = null;
        let data :number[][] = [];
        if (sensorRecording && sensorRecording.data.length > 0) {
            data = data.concat(sensorRecording.data);
        }
        if(preRecording && preRecording.data.length > 0) {
            data = data.concat(preRecording.data);
        }
        if(prediction && prediction.length > 0) {
            data = data.concat(prediction);
        }
        for(let d of data) {
            let y = d[1];

            if (yMin == null || y < yMin) {
                yMin = y;
            }

            if (yMax == null || y > yMax) {
                yMax = y;
            }
        }
        this.setState({
            yMin,
            yMax
        });
    }

    handleRescale = (xRange:number[], yRange:number[]) => {
        this.setState({
            yMin: yRange[0],
            yMax: yRange[1],
            xMin: xRange[0],
            xMax: xRange[1]
        });
        if (this.props.onGraphZoom) {
            this.props.onGraphZoom(xRange[0], xRange[1]);
        }
    }

    handleResetScale = () => {
        this.scaleToData();
    }

    componentWillReceiveProps(nextProps:SensorGraphProps) {
        const { dataReset, xStart, xEnd } = this.props;
        if (!dataReset && nextProps.dataReset) {
            this.lastDataIndex = 0;

            // if sensor type changes, revert to default axis range for sensor
            const { sensorRecording } = this.props,
                  nextSensorRecording = nextProps.sensorRecording;
            if (sensorRecording?.unit !== nextSensorRecording?.unit) {
                this.setState({ yMin: null, yMax: null });
            }
        }
        if (nextProps.xEnd !== xEnd || nextProps.xStart !== xStart) {
            this.setState({
                xMin: nextProps.xStart,
                xMax: nextProps.xEnd
            });
        }
        this.scaleToData();
    }

    xLabel() {
        const { isLastGraph, timeUnit } = this.props;
        return isLastGraph ? `Time (${timeUnit})` : "";
    }

    yLabel() {
        const { sensorRecording, preRecording} = this.props;
        const source = sensorRecording || preRecording
        // label the data (if any) or the current sensor (if no data)
        return source?.name
                ? `${source.name} (${source.unit})`
                : "Sensor Reading (-)";
    }

    renderGraph(graphWidth:number|null) {
        const { sensorRecording } = this.props;
        const { yMin, yMax, xMin, xMax } = this.state;

        const labels = [] as string[];

        // Dygraph requires each row of data to have the same number of columns.
        // If we have both the sensor and pre-recording data, plot both.
        const data = sensorRecording?.data || []
        return (
            <div className="sensor-graph">
              <Graph
                title={this.props.title}
                width={graphWidth}
                height={this.props.height}
                data={data}
                onRescale={this.handleRescale}
                resetScaleF={this.handleResetScale}
                xMin={xMin}
                xMax={xMax}
                yMin={yMin || 0}
                yMax={yMax || 100}
                // TODO: figure out default precision
                valuePrecision={sensorRecording?.precision || 2}
                xLabel={this.xLabel()}
                yLabel={this.yLabel()}
                yLabels={labels}
                assetsPath={this.props.assetsPath}
                singleReads={this.props.singleReads}
                predictionState={this.props.predictionState}
                prediction={this.props.prediction}
                preRecording={this.props.preRecording?.data || []}
                setPredictionF={this.props.setPredictionF}
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
