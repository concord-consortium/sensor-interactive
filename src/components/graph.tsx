import * as React from "react";
import Dygraph from "dygraphs";
import { Format } from "../utils/format";

import "./dygraph.css";

export interface GraphProps {
    title:string|undefined;
    width:number|null;
    height:number|null;
    data:number[][];
    onRescale:(xRange:number[], yRange:number[]) => void;
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;
    valuePrecision:number;
    xLabel:string|undefined;
    yLabel:string|undefined;
    [key:string]: any;
    assetsPath: string;
    singleReads?: boolean;
}

export interface GraphState {
    width:number|null;
    height:number|null;
    data:number[][];
    dataLength:number;
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;
    valuePrecision:number;
    xLabel:string|undefined;
    yLabel:string|undefined;
    xAxisFix:number;
    yAxisFix:number;
    [key:string]: any;
}

const GRAPH1_LINE_COLOR = "#007fcf";
const GRAPH2_LINE_COLOR = "#da5d1d";
const AXIS_LABEL_WIDTH =  65;
const CANVAS_FILL_COLOR = "rgba(248, 248, 248, 1.0)";

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
            dataLength: this.props.data ? this.props.data.length : 0,
            xMin: this.props.xMin,
            xMax: this.props.xMax,
            yMin: this.props.yMin,
            yMax: this.props.yMax,
            valuePrecision: this.props.valuePrecision,
            xLabel: this.props.xLabel,
            yLabel: this.props.yLabel,
            xAxisFix: Format.getAxisFix('x', this.props.xMax - this.props.xMin, this.props.width),
            yAxisFix: Format.getAxisFix('y', this.props.yMax - this.props.yMin, this.props.height)
        };

        this.dyUpdateProps = ["width", "height", "xMin", "xMax", "yMin", "yMax",
                                "valuePrecision", "xLabel", "yLabel"];
    }

    labels():string[] {
        const numColumns = this.state.data[0] ? this.state.data[0].length : 0;
        if (numColumns > 2){
            return ["x", "y", "y2"];
        }
        return [this.state.xLabel || "x", this.state.yLabel || "y"];
    };

    update():void {
        if(!this.dygraph) {
            return;
        }
        const { data, xMin, xMax, yMin, yMax, xLabel, yLabel } = this.state;
        this.dygraph.updateOptions({
            file: dyGraphData(data, this.props.singleReads),
            dateWindow: [xMin, xMax],
            valueRange: [yMin, yMax],
            labels: this.labels(),
            xlabel: xLabel,
            ylabel: yLabel
        });

        // override @types/dygraphs definition to allow no arguments
        // (which is explicitly described by the docs as resizing to parent div)
        type FResize = (width?:number, height?:number) => void;
        (this.dygraph.resize as FResize)();
    }

    autoScale = () => {
        if (this.state.data && (this.state.data.length > 1))
            this.dygraph.resetZoom();
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

    componentDidMount() {
        const color = this.props.title === "graph1" ? GRAPH1_LINE_COLOR : GRAPH2_LINE_COLOR;
        const singleReadOptions: Partial<dygraphs.Options> = this.props.singleReads ? {drawPoints: true, strokeWidth: 0, pointSize: 10}: {};

        this.dygraph = new Dygraph("sensor-graph-" + this.props.title,
            dyGraphData(this.state.data, this.props.singleReads), {
            color: color,
            dateWindow: [0, this.state.xMax],
            valueRange: [this.state.yMin, this.state.yMax],
            zoomCallback: this.onRescale,
            axes: {
                x: {
                    valueFormatter: (val:number) => {
                        return Format.formatFixedValue(val, this.state.xAxisFix);
                    },
                    axisLabelFormatter: (val:number) => {
                        return this.props.xLabel
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
            },
            labels: this.labels(),
            xlabel: this.state.xLabel,
            ylabel: this.state.yLabel,
            legend: "follow",
            underlayCallback: function(canvas:any, area:any, g:any) {
                canvas.fillStyle = CANVAS_FILL_COLOR;
                canvas.fillRect(area.x, area.y, area.w, area.h);
            },
            ...singleReadOptions
        });
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

        if((newState.yMin != null) || (newState.yMax != null)) {
            const yMin = newState.yMin != null ? newState.yMin : this.state.yMin,
                  yMax = newState.yMax != null ? newState.yMax : this.state.yMax;
            newState.yAxisFix = Format.getAxisFix('y', yMax - yMin, nextProps.height);
        }
        if(newState.xMax) {
            const xMin = newState.xMin != null ? newState.xMin : this.state.xMin,
                  xMax = newState.xMax != null ? newState.xMax : this.state.xMax;
            newState.xAxisFix = Format.getAxisFix('x', xMax - xMin, nextProps.width);
        }

        this.setState(newState);
    }

    shouldComponentUpdate(nextProps:GraphProps, nextState:GraphState):boolean {
        return (nextState.data !== this.state.data) ||
                (nextState.dataLength !== this.state.dataLength) ||
                this.dyUpdateProps.some((prop) => nextState[prop] !== this.state[prop]);
    }

    componentDidUpdate(prevProps:GraphProps, prevState:GraphState) {
        this.update();
    }

    render() {
        const { width, height, title } = this.props;
        let graphStyle:{width?:number; height?:number} = {};
        if (width && isFinite(width))
            graphStyle.width = width;
        if (height && isFinite(height))
            graphStyle.height = height;

        // don't show the rescale button if there's no data to scale
        const { data } = this.state;
        let buttonStyle:{display?:string} = {},
            hasData = data && (data.length > 1);
        if (!hasData)
            buttonStyle.display = "none";

        return (
            <div style={{position: "relative"}}>
                <div id={"sensor-graph-" + title} className="graph-box" style={graphStyle}></div>
                <div className="graph-rescale-button" onClick={this.autoScale} title="Show all data (autoscale)">
                    <svg className="icon rescale">
                        <use xlinkHref={`${this.props.assetsPath}/images/icons.svg#icon-rescale`} />
                    </svg>
                </div>
            </div>
        );
    }
}
