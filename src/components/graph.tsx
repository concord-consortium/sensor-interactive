import * as React from "react";
import Dygraph from "dygraphs";
import { Format } from "../utils/format";

export interface GraphProps {
    title:string|undefined;
    width:number|null;
    height:number|null;
    data:number[][];
    onZoom:(xStart:number, xEnd:number) => void;
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;
    xLabel:string|undefined;
    yLabel:string|undefined;
    [key:string]: any;
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
    xLabel:string|undefined;
    yLabel:string|undefined;
    xFix:number;
    yFix:number;
    xAxisFix:number;
    yAxisFix:number;
    [key:string]: any;
}

// dygraph doesn't handle empty data
function dyGraphData(data:number[][]) {
    return data && data.length ? data : [[0,0]];
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
            xLabel: this.props.xLabel,
            yLabel: this.props.yLabel,
            xFix: Format.getFixValue(this.props.xMax - this.props.xMin),
            yFix: Format.getFixValue(this.props.yMax - this.props.yMin),
            xAxisFix: Format.getAxisFix(this.props.xMax - this.props.xMin),
            yAxisFix: Format.getAxisFix(this.props.yMax - this.props.yMin),
        };
        
        this.dyUpdateProps = ["width", "height", "xMin", "xMax", "yMin", "yMax", "xLabel", "yLabel"];
        this.autoScale = this.autoScale.bind(this);
        this.onZoom = this.onZoom.bind(this);
    }
    
    update():void {
        if(!this.dygraph) {
            return;
        }
        const { data, xMin, xMax, yMin, yMax, xLabel, yLabel } = this.state;
        this.dygraph.updateOptions({
            file: dyGraphData(data),
            dateWindow: [xMin, xMax],
            valueRange: [yMin, yMax],
            xlabel: xLabel,
            ylabel: yLabel
        });

        // override @types/dygraphs definition to allow no arguments
        // (which is explicitly described by the docs as resizing to parent div)
        type FResize = (width?:number, height?:number) => void;
        (this.dygraph.resize as FResize)();
    }

    autoScale() {
        if (this.state.data && (this.state.data.length > 1))
            this.dygraph.resetZoom();
    }
    
    onZoom(xStart:number, xEnd:number) {
        var yRange = this.dygraph.yAxisRange();
        var xRange = this.dygraph.xAxisRange();
        this.setState({
            xFix: Format.getFixValue(xRange[1] - xRange[0]),
            yFix: Format.getFixValue(yRange[1] - yRange[0]),
            xAxisFix: Format.getAxisFix(xRange[1] - xRange[0]),
            yAxisFix: Format.getAxisFix(yRange[1] - yRange[0])
        });
        this.props.onZoom(xStart, xEnd);
    }
    
    componentDidMount() {
        this.dygraph = new Dygraph("sensor-graph-" + this.props.title,
            dyGraphData(this.state.data), {
            dateWindow: [0, this.state.xMax],
            zoomCallback: this.onZoom,
            axes: {
                x: {
                    valueFormatter: (val:number) => {
                        return Format.formatFixedValue(val, 2);
                    },
                    axisLabelFormatter: (val:number) => {
                        return this.props.xLabel
                                ? Format.formatFixedValue(val, this.state.xAxisFix)
                                : "";
                    }
                },
                y: {
                    valueFormatter: (val:number) => {
                        return Format.formatFixedValue(val, this.state.yFix);
                    },
                    axisLabelFormatter: (val:number) => {
                        return Format.formatFixedValue(val, this.state.yAxisFix, "", true);
                    }
                }
            },
            xlabel: this.state.xLabel,
            ylabel: this.state.yLabel,
            legend: "follow",
            underlayCallback: function(canvas:any, area:any, g:any) {
                canvas.fillStyle = "rgba(255, 255, 255, 1.0)";
                canvas.fillRect(area.x, area.y, area.w, area.h);
            }
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
        
        if(data.length !== this.state.dataLength) {
            newState.data = data;
            newState.dataLength = data.length;
        }
        
        if(newState.yMax) {
            newState.yFix = Format.getFixValue(newState.yMax);
            newState.yAxisFix = Format.getAxisFix(newState.yMax);
        }
        if(newState.xMax) {
            newState.xFix = Format.getFixValue(newState.xMax);
            newState.xAxisFix = Format.getAxisFix(newState.xMax);
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
                <a onClick={this.autoScale}
                    className="graph-rescale-button"
                    style={buttonStyle}
                    title="Show all data (autoscale)">
                    <i className="fa fa-arrows fa-lg"></i>
                </a>
            </div>
        );
    }
}
