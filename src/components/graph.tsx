import * as React from "react";
import Dygraph from "dygraphs";
import { Format } from "../utils/format";
import { PredictionState } from "./types";
import { OverlayGraph } from "./overlay-graph";
import { barChartPlotter, threeColumnBarPlotter, twoColumnBarPlotterAuthored, twoColumnBarPlotterPrediction } from "../utils/bar-chart-plotter";

import "./dygraph.css";
import { OverlayBarGraph } from "./overlay-bar-graph";

export interface GraphProps {
    title:string|undefined;
    width:number|null;
    height:number|null;
    data:number[][];
    predictionState: PredictionState;
    isRescaled: boolean;
    onRescaleClick: () => void;
    onRescale:(xRange:number[], yRange:number[]) => void;
    resetScaleF:() => void;
    setPredictionF: (data: number[][]) => void;
    prediction: number[][];
    usePrediction: boolean|undefined;
    preRecording?: number[][];
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;
    valuePrecision:number;
    xLabel:string|undefined;
    yLabel:string|undefined;
    yLabels:string[];
    [key:string]: any;
    assetsPath: string;
    singleReads?: boolean;
    displayType: string;
    useAuthoredData?: boolean;
    disabled: boolean;
}

export interface GraphState {
    width: number|null;
    height: number|null;
    data: number[][];
    predictionState: PredictionState;
    dataLength: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    valuePrecision: number;
    xLabel: string|undefined;
    yLabel: string|undefined;
    xAxisFix: number;
    yAxisFix: number;
    [key: string]: any;
    multiBarCount: number;
}

// Zeplin specs:  https://zpl.io/09kdQlE
export const GRAPH1_LINE_COLOR = "#0081ff";
export const GRAPH2_LINE_COLOR = "#008a00";
export const PREDICTION_LINE_COLOR = "#ff8415";
export const AUTHORED_LINE_COLOR = "#d100d1";

const AXIS_LABEL_WIDTH =  65;
const CANVAS_FILL_COLOR = "#ffffff";

// dygraph doesn't handle empty data
function dyGraphData(data:number[][], useOffScreenPoint?: boolean) {
    return data && data.length ? data : (useOffScreenPoint ? [[-100,0]] : [[0,0]]);
}

export class Graph extends React.Component<GraphProps, GraphState> {

    private dygraph:Dygraph;
    private dyUpdateProps:string[];

    constructor(props: GraphProps) {
        super(props);

        this.state = {
            width: this.props.width,
            height: this.props.height,
            data: this.props.data || [],
            predictionState: this.props.predictionState,
            dataLength: this.props.data ? this.props.data.length : 0,
            xMin: this.props.xMin,
            xMax: this.props.xMax,
            yMin: this.props.yMin,
            yMax: this.props.yMax,
            valuePrecision: this.props.valuePrecision,
            xLabel: this.props.xLabel,
            yLabel: this.props.yLabel,
            xAxisFix: Format.getAxisFix('x', this.props.xMax - this.props.xMin, this.props.width),
            yAxisFix: Format.getAxisFix('y', this.props.yMax - this.props.yMin, this.props.height),
            multiBarCount: this.setMultiBarCount(),
            isRescaled: false,
        };

        this.getPlotterType = this.getPlotterType.bind(this);
        this.dataForMultiBar = this.dataForMultiBar.bind(this);
        this.useMultiBar = this.useMultiBar.bind(this);
        this.makeDygraph = this.makeDygraph.bind(this);
        this.setMultiBarCount = this.setMultiBarCount.bind(this);
        this.dyUpdateProps = ["width", "height", "xMin", "xMax", "yMin", "yMax",
                                "valuePrecision", "xLabel", "yLabel", "predictionState"];
    }

    useMultiBar() {
      const { displayType, useAuthoredData, usePrediction } = this.props;
      return displayType === "bar" && (useAuthoredData || usePrediction);
    }

    setMultiBarCount() {
      const { useAuthoredData, usePrediction } = this.props;
      if (!this.useMultiBar()) {
        return 0;
      }
      if (useAuthoredData && usePrediction) {
        return 3;
      } else {
        return 2;
      }
    }

    dataForMultiBar() {
      const {useAuthoredData, preRecording, usePrediction, prediction} = this.props;
      const {data} = this.state;
      const joinedData = [];

      const beginningPoint = preRecording && usePrediction ? [0, 0, 0, 0] : [0, 0, 0];
      joinedData.push(beginningPoint);

      for (let i = 0; i < 6; i++){
        const dataPoint = data.length > i + 1 ? data[i + 1][1] : 0;
        const dataPointTime = dataPoint > 0 ? data[i + 1][2] : 0;
        const predictionPoint = prediction && prediction.length > i ? prediction[i][1] : 0;
        const preRecordingPoint = preRecording && preRecording.length > i ? preRecording[i][1] : 0;

        if (usePrediction && useAuthoredData) {
          joinedData.push([i + 1, preRecordingPoint, predictionPoint, dataPoint, dataPointTime]);
        } else if (usePrediction && !useAuthoredData) {
          joinedData.push(([i + 1, predictionPoint, dataPoint, dataPointTime]))
        } else if (!usePrediction && useAuthoredData) {
          joinedData.push([i + 1, preRecordingPoint, dataPoint, dataPointTime]);
        }
      }

      return joinedData;
    }

    getPlotterType() {
      const {useAuthoredData, usePrediction} = this.props;
      if (this.useMultiBar() && useAuthoredData && usePrediction) {
        return threeColumnBarPlotter;
      } else if (this.useMultiBar() && useAuthoredData) {
        return twoColumnBarPlotterAuthored;
      } else if (this.useMultiBar() && usePrediction) {
        return twoColumnBarPlotterPrediction;
      } else if (this.props.displayType === "bar") {
        return barChartPlotter;
      } else {
        return Dygraph.Plotters.linePlotter;
      }
    }

    labels():string[] {
        const yLabels = this.props.yLabels.length < 1
            ? ["y"]
            : this.props.yLabels;
        return [this.state.xLabel || "x", ...yLabels];
    };

    series() {
        const result: Record<string,{color:string, plotter: any}> = {};
        const labels = this.labels();
        const plotter = this.getPlotterType();

        for (let label of labels) {
            if (label === "x" || label === this.state.xLabel) { continue; }
            if (label === "prediction") {
                result[label] = {
                    color: PREDICTION_LINE_COLOR,
                    plotter: plotter
                };
            }
            else if (label === "recording") {
                result[label] = {
                    color: AUTHORED_LINE_COLOR,
                    plotter: plotter
                };
            }
            else {
                result[label] = {
                    color: GRAPH1_LINE_COLOR,
                    plotter: plotter
                };
            }
        }
        return result;
    }

    update():void {
        if(!this.dygraph) {
            return;
        }
        const { singleReads } = this.props;
        const { data, predictionState, xMin, xMax, yMin, yMax, xLabel, yLabel } = this.state;

        const dataForGraph = this.useMultiBar() ? this.dataForMultiBar() : dyGraphData(data, singleReads);

        const singleReadOptions: Partial<dygraphs.Options> = singleReads
            ? {drawPoints: true, strokeWidth: 0, pointSize: 10}
            : {};
        const predictionOptions: Partial<dygraphs.Options> = predictionState === "started"
            ? { width: 0 }
            : {};

        this.dygraph.updateOptions({
            file: dataForGraph,
            dateWindow: [xMin, xMax],
            valueRange: [yMin, yMax],
            plotter: this.getPlotterType(),
            xlabel: xLabel,
            ylabel: yLabel,
        });

        if (this.props.displayType !== "bar") {
          this.dygraph.updateOptions({
            labels: this.labels(),
            series: this.series(),
            ...singleReadOptions,
            ...predictionOptions
          })
        }

        type FResize = (width?:number, height?:number) => void;
        (this.dygraph.resize as FResize)();
    }

    onRescale = (xStart:number, xEnd:number, yRanges:number[][]) => {
        var yRange = this.dygraph.yAxisRange();
        var xRange = this.dygraph.xAxisRange();
        this.setState({
            xAxisFix: Format.getAxisFix('x', xRange[1] - xRange[0], this.props.width),
            yAxisFix: Format.getAxisFix('y', yRange[1] - yRange[0], this.props.height)
        });
        this.props.onRescale(xRange, yRange);
    }

    colorForGraphName(graphName:string):string {
        let color = GRAPH1_LINE_COLOR;
        switch (graphName) {
            case "graph2":
                color = GRAPH2_LINE_COLOR;
                break;
            case "prediction":
                color = PREDICTION_LINE_COLOR;
                break;
            case "prediction2":
                color = PREDICTION_LINE_COLOR;
                break;
            case "authored":
                color = AUTHORED_LINE_COLOR;
                break;
            case "authored2":
                color = AUTHORED_LINE_COLOR;
                break;
        }
        return color;
    }

    makeDygraph() {
        const color = this.colorForGraphName(this.props.title||"");
        const strokeWidth = 2;
        const singleReadOptions: Partial<dygraphs.Options> = this.props.singleReads
            ? {drawPoints: true, strokeWidth: 0, pointSize: 10}
            : {};

        let dygraphOptions:dygraphs.Options = {
            color: color,
            strokeWidth,
            drawPoints: false,
            dateWindow: [0, this.props.xMax],
            valueRange: [this.props.yMin, this.props.yMax],
            zoomCallback: this.onRescale,
            xlabel: this.state.xLabel,
            ylabel: this.state.yLabel,
            legend: "follow",
            underlayCallback: function(canvas:any, area:any, g:any) {
                canvas.fillStyle = CANVAS_FILL_COLOR;
                canvas.fillRect(area.x, area.y, area.w, area.h);
            },
            plotter: this.getPlotterType(),
        };

        dygraphOptions.axes = {
            x: {
                valueFormatter: (val:number) => {
                    return Format.formatFixedValue(val, this.state.xAxisFix);
                },
                axisLabelFormatter: (val:number) => {
                    const { data, displayType, singleReads, xLabel } = this.props;
                    const dataForLabels = this.useMultiBar() ? this.dataForMultiBar() : data;
                    return displayType === "bar" && singleReads
                            ? Format.formatSingleReadBarLabel(val, dataForLabels)
                            : xLabel
                                ? Format.formatFixedValue(val, this.state.xAxisFix)
                                : "";
                }
            },
            y: {
                valueFormatter: (val:number) => {
                    return Format.formatFixedValue(val, this.state.valuePrecision);
                },
                axisLabelFormatter: (val:number) => {
                    return Format.formatFixedValue(val, this.state.yAxisFix, "", true);
                },
                axisLabelWidth: AXIS_LABEL_WIDTH
            }
        };

        if (this.props.displayType !== "bar") {
          dygraphOptions.labels = this.labels(),
          dygraphOptions.series = this.series(),
          dygraphOptions = {...dygraphOptions, ...singleReadOptions};
        }

        const dataForGraph = this.useMultiBar() ? this.dataForMultiBar() : dyGraphData(this.state.data, this.props.singleReads);

        this.dygraph = new Dygraph(
            "sensor-graph-" + this.props.title,
            dataForGraph,
            dygraphOptions
        );
    }

    componentDidMount() {
        this.makeDygraph();
    }

    componentWillReceiveProps(nextProps:GraphProps) {
        var data = nextProps.data || [];
        var newState:any = {};

        this.dyUpdateProps.forEach((prop)=> {
            if(nextProps[prop] !== this.props[prop]) {
                newState[prop] = nextProps[prop];
            }
        });

        newState.data = data;
        newState.dataLength = data.length;

        newState.yAxisFix = Format.getAxisFix('y', nextProps.yMax - nextProps.yMin, nextProps.height);
        newState.xAxisFix = Format.getAxisFix('x', nextProps.xMax - nextProps.xMin, nextProps.width);

        this.setState(newState);
    }

    shouldComponentUpdate(nextProps:GraphProps, nextState:GraphState):boolean {
        if(nextState.data !== this.state.data) {
            return true
        }
        if(nextState.dataLength !== this.state.dataLength) {
            return true
        }
        if(nextState.data?.length > 0 && this.state.data?.length > 0) {
            if (nextState.data[0].length !== this.state.data[0].length) {
                return true;
            }
        }
        if(this.dyUpdateProps.some((p) => nextState[p] !== this.state[p])) {
            return true;
        }
        if (nextProps.isRescaled !== this.props.isRescaled) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps:GraphProps, prevState:GraphState) {
        this.update();
    }

    render() {
        const {width, height, title, setPredictionF, prediction, preRecording, usePrediction } = this.props;
        let graphStyle:{width?:number; height?:number} = {};
        if (width && isFinite(width))
            graphStyle.width = width;
        if (height && isFinite(height))
            graphStyle.height = height;

        // don't show the rescale button if there's no data to scale
        const { data } = this.state;
        const isBarGraph = this.props.displayType === "bar";

        let buttonStyle:{display?:string} = {},
            hasData = data && (data.length > 1);
        if (!hasData)
            buttonStyle.display = "none";
        const isAutoScaleDisabled = !hasData && prediction.length === 0 && (!preRecording || preRecording.length === 0);
        return (
            <div style={{position: "relative"}}>
                <div id={"sensor-graph-" + title} className="graph-box" style={graphStyle}></div>

                { !isBarGraph && usePrediction &&
                  <OverlayGraph
                    height={height||100}
                    width={width||100}
                    show={true}
                    enableEdit={this.state.predictionState == "started"}
                    parentGraph={this.dygraph}
                    setDataF={setPredictionF}
                    data={prediction}
                    color={PREDICTION_LINE_COLOR}
                    maxX={this.props.xMax}
                    maxY={this.props.yMax}
                    minX={this.props.xMin}
                    minY={this.props.yMin}
                    key="prediction"
                  />
                }
                {
                  isBarGraph && usePrediction &&
                  <OverlayBarGraph
                    height={height||100}
                    width={width||100}
                    show={true}
                    enableEdit={this.state.predictionState == "started"}
                    parentGraph={this.dygraph}
                    setDataF={setPredictionF}
                    data={prediction}
                    color={PREDICTION_LINE_COLOR}
                    maxX={this.props.xMax}
                    maxY={this.props.yMax}
                    minX={this.props.xMin}
                    minY={this.props.yMin}
                    key="prediction"
                    multiBarCount={this.state.multiBarCount}
                />

                }
                { preRecording && !isBarGraph &&
                    <OverlayGraph
                      height={height||100}
                      width={width||100}
                      show={true}
                      enableEdit={false}
                      parentGraph={this.dygraph}
                      setDataF={ ()=> null}
                      data={preRecording}
                      color={AUTHORED_LINE_COLOR}
                      maxX={this.props.xMax}
                      maxY={this.props.yMax}
                      minX={this.props.xMin}
                      minY={this.props.yMin}
                      key="preRecording"
                    />
                }

                <div
                  className={`graph-rescale-button ${this.props.isRescaled ? "selected" : ""} ${isAutoScaleDisabled ? "disabled" : ""}`}
                  onClick={this.props.onRescaleClick}
                  title="Show all data (autoscale)"
                >
                  <svg className={`icon rescale ${this.props.isRescaled ? "selected" : ""} ${isAutoScaleDisabled ? "disabled" : ""}`}>
                    <use xlinkHref={`${this.props.assetsPath}/images/icons.svg#icon-rescale`} />
                  </svg>
                </div>
            </div>
        );
    }
}
