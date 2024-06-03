import * as React from "react";
import { IAuthoredMinMax, SensorRecording } from "../interactive/types";
import { Sensor } from "../models/sensor";
import { Graph } from "./graph";
import { PredictionState } from "./types";
import { SensorDefinitions } from "../models/sensor-definitions";

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
    usePrediction:boolean|undefined;
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
    sensorUnit:any;
    displayType: string;
    useAuthoredData?: boolean;
    overrideAxes?: boolean;
    authoredMinMax?: IAuthoredMinMax;
    disabled: boolean;
}

interface SensorGraphState {
    yMin:number;
    yMax:number;
    xMin:number;
    xMax:number;
    isRescaled: boolean;
}

export default class SensorGraph extends React.Component<SensorGraphProps, SensorGraphState> {

    sensor:Sensor;
    lastDataIndex:number = 0;

    constructor(props:SensorGraphProps) {
      super(props);
      this.state = {
          xMin: this.props.xStart,
          xMax: this.props.xEnd,
          yMin: 0,
          yMax: 100,
          isRescaled: false,
      };
    }

    componentDidMount(){
      const scale = this.getDefaultScale();
      this.setState(scale);
    }

    getDefaultScale() {
      const {usePrediction, useAuthoredData, sensorUnit, authoredMinMax, overrideAxes} = this.props;
      const { authoredXMin, authoredXMax, authoredYMin, authoredYMax } = authoredMinMax || {};

      let scale = {xMin: this.props.xStart, xMax: this.props.xEnd, yMin: 0, yMax: 100};

      if (overrideAxes) {
        if (authoredXMin !== undefined) {
          scale.xMin = authoredXMin;
        }
        if (authoredXMax !== undefined) {
          scale.xMax = authoredXMax + .01;
        }
        if (authoredYMin !== undefined) {
          scale.yMin = authoredYMin;
        }
        if (authoredYMax !== undefined) {
          scale.yMax = authoredYMax;
        }
      } else {
        if (this.props.sensorRecording?.unit) {
          const { minReading, maxReading } = SensorDefinitions[this.props.sensorRecording.unit];
          scale.yMin = minReading;
          scale.yMax = maxReading;
        } else if ((usePrediction || useAuthoredData) && sensorUnit) {
          const { yMin, yMax } = this.getSensorUnitMinAndMax();
          scale.yMin = yMin;
          scale.yMax = yMax;
        }
      }

      return scale;
    }

    getSensorUnitMinAndMax(){
      const {sensorUnit} = this.props;

      let yMin = SensorDefinitions[sensorUnit].minReading;
      let yMax = SensorDefinitions[sensorUnit].maxReading;
      return {yMin, yMax}
    }

    scaleToData() {
        const { sensorRecording, preRecording, prediction } = this.props;

        let data :number[][] = [];
        data = data.concat(sensorRecording?.data || [], preRecording?.data || [], prediction || []);

        // get y-min and y-max of data
        const yMin = Math.min(...data.map(d => d[1]));
        const yMax = Math.max(...data.map(d => d[1]));

        // get x-min and x-max of data
        const xMin = Math.min(...data.map(d => d[0]));
        const xMax = Math.max(...data.map(d => d[0]));

        this.setState({
            xMin,
            xMax,
            yMin,
            yMax
        });
    }

    handleAutoscaleToggleClick = () => {
    // this function is called when the user clicks the autoscale button
      const newValue = !this.state.isRescaled;

      if (!newValue) {
        const scale = this.getDefaultScale();
        this.setState(scale);
      } else {
        this.scaleToData();
      }

      this.setState({isRescaled: newValue});
    }

    handleDygraphZoom = (xRange:number[], yRange:number[]) => {
    // this function is called when the user either drags to zoom or double-clicks on the graph
      this.setState({
          yMin: yRange[0],
          yMax: yRange[1],
          xMin: xRange[0],
          xMax: xRange[1]
      });

      if (this.props.onGraphZoom) {
          this.props.onGraphZoom(xRange[0], xRange[1]);
      }

      this.setState({isRescaled: true});
    }

    componentWillReceiveProps(nextProps:SensorGraphProps) {
      const { dataReset, xStart, xEnd, sensorRecording, overrideAxes } = this.props;

      const stateChanges = {} as SensorGraphState;

      if (!dataReset && nextProps.dataReset) {
          this.lastDataIndex = 0;
          stateChanges.isRescaled = false;
      }

      // update Y axis to default range if sensor unit changes and overrideAxes is false
      if (!overrideAxes && sensorRecording?.unit !== nextProps.sensorRecording?.unit) {
          stateChanges.yMin = nextProps.sensorRecording?.min ?? 0;
          stateChanges.yMax = nextProps.sensorRecording?.max ?? 100;
      }

      if (nextProps.xEnd !== xEnd || nextProps.xStart !== xStart) {
          stateChanges.xMin = nextProps.xStart;
          stateChanges.xMax = nextProps.xEnd;
      }

      if (Object.keys(stateChanges).length > 0) {
          this.setState(stateChanges);
      }
    }

    isSingleReadBarGraph() {
      const { singleReads, displayType } = this.props;
      return singleReads && displayType === "bar";
    }

    processData() {
      const { sensorRecording } = this.props;

      // Dygraph requires each row of data to have the same number of columns.
      // If we have both the sensor and pre-recording data, plot both.
      const data = sensorRecording?.data || [];

      // Data needs to be modified for single-read bar graphs.
      if (!this.isSingleReadBarGraph()) {
        return data;
      } else {
        let processedData = [[0, 0]];
        for (let i = 0; i < data.length; i++) {
          // Single read bar graphs need to include values for time elapsed
          // which will be shown in the x-axis labels.
          const timeSinceLastRead = i > 0 ? data[i][0] : 0;
          processedData.push([i + 1, data[i][1], timeSinceLastRead]);
        }
        return processedData;
      }
    }

    xLabel() {
        const { isLastGraph, timeUnit } = this.props;
        let xAxisLabel = "";
        if (this.isSingleReadBarGraph()) {
            xAxisLabel = "Trials";
        } else if (isLastGraph) {
            xAxisLabel = `Time (${timeUnit})`;
        }
        return xAxisLabel;
    }

    yLabel() {
        const { sensorUnit } = this.props;
        if (sensorUnit) {
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

    renderGraph(graphWidth:number|null) {
        const { sensorRecording } = this.props;
        const { yMin, yMax, xMin, xMax } = this.state;

        const labels = [] as string[];

        const data = this.processData();
        return (
            <div className="sensor-graph">
              <Graph
                title={this.props.title}
                width={graphWidth}
                height={this.props.height}
                data={data}
                isRescaled={this.state.isRescaled}
                onAutoscaleToggleClick={this.handleAutoscaleToggleClick}
                dygraphZoomCallback={this.handleDygraphZoom}
                xMin={xMin}
                xMax={xMax}
                yMin={yMin}
                yMax={yMax}
                // TODO: figure out default precision
                valuePrecision={sensorRecording?.precision || 2}
                xLabel={this.xLabel()}
                yLabel={this.yLabel()}
                yLabels={labels}
                assetsPath={this.props.assetsPath}
                singleReads={this.props.singleReads}
                predictionState={this.props.predictionState}
                prediction={this.props.prediction}
                usePrediction={this.props.usePrediction}
                preRecording={this.props.preRecording?.data || []}
                setPredictionF={this.props.setPredictionF}
                displayType={this.props.displayType}
                useAuthoredData={this.props.useAuthoredData}
                disabled={this.props.disabled}
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
