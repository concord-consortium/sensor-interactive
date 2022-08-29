import * as React from "react";
import { SensorRecording } from "../interactive/types";
import { Sensor } from "../models/sensor";
import { Graph } from "./graph";
import { PredictionState } from "./types";
import { SensorDefinitions } from "../models/sensor-definitions";

const kSidePanelWidth = 20;

interface SensorGraphProps {
    width: number|null;
    height: number|null;
    graphIndex: number;
    sensorRecording?: SensorRecording;
    preRecording?: SensorRecording;
    prediction: number[][];
    predictionState: PredictionState;
    title: string;
    onGraphZoom: (xStart:number, xEnd:number) => void;
    onSensorSelect: (sensorIndex:number, columnID:string) => void;
    setPredictionF: (prediction:number[][]) => void;
    usePrediction: boolean|undefined;
    collecting: boolean;
    hasData: boolean;
    dataReset: boolean;
    timeUnit: string;
    xStart: number;
    xEnd: number;
    isSingletonGraph: boolean;
    isLastGraph: boolean;
    assetsPath: string;
    singleReads?: boolean;
    sensorUnit: any;
    displayType: string;
}

interface SensorGraphState {
    yMin: number;
    yMax: number;
    xMin: number;
    xMax: number;
}

export default class SensorGraph extends React.Component<SensorGraphProps, SensorGraphState> {

    sensor: Sensor;
    lastDataIndex: number = 0;

    constructor(props:SensorGraphProps) {
        super(props);
        this.state = {
            xMin: this.props.xStart,
            xMax: this.isSingleReadBarGraph() ? 2 : this.props.xEnd,
            yMin: this.props.preRecording?.min ?? 0,
            yMax: this.props.preRecording?.max ?? 100,
        };
    }

    componentDidMount(){
      const {usePrediction, sensorUnit} = this.props;
      if (usePrediction && sensorUnit) {
        const { yMin, yMax } = this.getSensorUnitMinAndMax();
        this.setState({yMin, yMax});
      }
    }

    getSensorUnitMinAndMax(){
      const {sensorUnit} = this.props;

      let yMin = SensorDefinitions[sensorUnit].minReading;
      let yMax = SensorDefinitions[sensorUnit].maxReading;
      return {yMin, yMax}
    }

    scaleToData() {
        const { sensorRecording, preRecording, prediction } = this.props;

        let yMin = sensorRecording?.min ?? preRecording?.min ?? this.getSensorUnitMinAndMax().yMin;
        let yMax = sensorRecording?.max ?? preRecording?.max ?? this.getSensorUnitMinAndMax().yMax;

        let data: number[][] = [];
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

    handleRescale = (xRange: number[], yRange: number[]) => {
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

    componentWillReceiveProps(nextProps: SensorGraphProps) {
        const { dataReset, xStart, xEnd, sensorRecording } = this.props;

        if (!dataReset && nextProps.dataReset) {
            this.lastDataIndex = 0;

        }

        const stateChanges = {} as SensorGraphState;
        // if sensor type changes, revert to default axis range for sensor
        if (sensorRecording?.unit !== nextProps.sensorRecording?.unit) {
            stateChanges.yMin =  nextProps.sensorRecording?.min ?? 0;
            stateChanges.yMax = nextProps.sensorRecording?.max ?? 100;
        }
        if ((nextProps.xEnd !== xEnd || nextProps.xStart !== xStart) && !this.isSingleReadBarGraph()) {
            stateChanges.xMin = nextProps.xStart;
            stateChanges.xMax = nextProps.xEnd;
        }
        if (Object.keys(stateChanges).length > 0) {
            this.setState(stateChanges);
        }
    }

    xLabel() {
        const { isLastGraph, timeUnit } = this.props;
        return isLastGraph ? `Time (${timeUnit})` : "";
    }

    yLabel() {
        const { usePrediction, sensorUnit } = this.props;
        if (usePrediction && sensorUnit) {
          const measurementName = SensorDefinitions[sensorUnit].measurementName;
          const displayUnits =  SensorDefinitions[sensorUnit].displayUnits;
          const units = displayUnits || sensorUnit;
          return `${measurementName} (${units})`
        }

        const { sensorRecording, preRecording} = this.props;
        const source = sensorRecording || preRecording
        // label the data (if any) or the current sensor (if no data)
        return source?.name
                ? `${source.name} (${source.displayUnits || source.unit})`
                : "Sensor Reading (-)";
    }

    isSingleReadBarGraph() {
      const { singleReads, displayType } = this.props;
      return singleReads && displayType === "bar";
    }

    processData() {
      const { graphIndex, sensorRecording } = this.props;

      // Dygraph requires each row of data to have the same number of columns.
      // If we have both the sensor and pre-recording data, plot both.
      const data = sensorRecording?.data || [];

      // Data needs to be modified for single-read bar graphs.
      if (!this.isSingleReadBarGraph()) {
        return data;
      } else {
        // For single-read bar graphs, we essentially need to return only a single data point
        // since each single-read bar graph shows only one point of data. There's very possibly
        // a better way to filter what's sent to each graph, maybe even before the data gets
        // passed to the SensorGraph component?
        return data.length >= graphIndex + 1
                 // Not sure why the [0,0] is required, but the graphs won't render without it.
                 ? [[0,0], [1, data[graphIndex][1]]]
                 : []
      }
    }

    processPredictionData() {
      const { graphIndex, prediction } = this.props;

      // Data needs to be modified for single-read bar graphs.
      if (!this.isSingleReadBarGraph()) {
        return prediction;
      } else {
        // For single-read bar graphs, we essentially need to return only a single data point
        // since each single-read bar graph shows only one point of data. There's very possibly
        // a better way to filter what's sent to each graph, maybe even before the data gets
        // passed to the SensorGraph component?
        return prediction.length >= graphIndex + 1
                 // Not sure why the [0,0] is required, but the graphs won't render without it.
                 ? [[0,0], [1, prediction[graphIndex][1]]]
                 : []
      }
    }

    renderGraph(graphWidth:number|null) {
        const { assetsPath, displayType, height, predictionState, preRecording,
                sensorRecording, setPredictionF, singleReads, title } = this.props;
        const { yMin, yMax, xMin, xMax } = this.state;

        const labels = [] as string[];
        const data = this.processData();

        return (
            <div className="sensor-graph">
              <Graph
                title={title}
                width={graphWidth}
                height={height}
                data={data}
                onRescale={this.handleRescale}
                resetScaleF={this.handleResetScale}
                xMin={xMin}
                xMax={xMax}
                yMin={yMin}
                yMax={yMax}
                // TODO: figure out default precision
                valuePrecision={sensorRecording?.precision || 2}
                xLabel={this.xLabel()}
                yLabel={this.yLabel()}
                yLabels={labels}
                assetsPath={assetsPath}
                singleReads={singleReads}
                predictionState={predictionState}
                prediction={this.processPredictionData()}
                preRecording={preRecording?.data || []}
                setPredictionF={setPredictionF}
                displayType={displayType}
                graphIndex={this.props.graphIndex}
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
