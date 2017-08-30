import * as React from "react";
import Dygraph from "dygraphs";
import { Format } from "../utils/format";

export interface GraphProps {
    title:string|undefined;
    width:number;
    height:number;
    data:number[][];
    onZoom:(xStart:number, xEnd:number) => void;
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;
    xLabel:string|undefined;
    yLabel:string|undefined;
}

export interface GraphState {
    width:number;
    height:number;
    data:number[][];
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
}

export class Graph extends React.Component<GraphProps, GraphState> {
    
    private dygraph:Dygraph;
    private dyUpdateProps:string[];
    private lastLabel:number = 0;
    
    constructor(props: GraphProps) {
        super(props);
        
        this.state = {
            width: this.props.width,
            height: this.props.height,
            data: this.props.data,
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
    
    // TODO: remove redundant calls
    checkData(data:number[][]):number[][] {
        if(!data.length) {
            data = [[0,0]];
        }
        return data;
    }
    
    update():void {
        if(!this.dygraph) {
            return;
        }
        var data = this.checkData(this.state.data);
        this.dygraph.updateOptions({
            file: data,
            dateWindow: [0, this.state.xMax],
            valueRange: [this.state.yMin, this.state.yMax],
            xlabel: this.state.xLabel,
            ylabel: this.state.yLabel
        });
        this.dygraph.resize();
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
        var data = this.checkData(this.state.data);
        
        this.dygraph = new Dygraph("sensor-graph-" + this.props.title, data, {
            dateWindow: [0, this.state.xMax],
            zoomCallback: this.onZoom,
            axes: {
                x: {
                    valueFormatter: (val:number) => {
                        return Format.formatFixedValue(val, 2);
                    },
                    axisLabelFormatter: (val:number) => {
                        return Format.formatFixedValue(val, this.state.xAxisFix);
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
            underlayCallback: function(canvas, area, g) {
                canvas.fillStyle = "rgba(255, 255, 255, 1.0)";
                canvas.fillRect(area.x, area.y, area.w, area.h);
            }
        });
    }

    componentWillReceiveProps(nextProps:GraphProps) {
        var data = this.checkData(nextProps.data);
        
        var newState:any = {};
        this.dyUpdateProps.forEach((prop)=> {
            if(nextProps[prop] !== this.props[prop]) {
                newState[prop] = nextProps[prop];
            }
        });
        
        if(nextProps.data.length !== this.state.data.length) {
            newState.data = nextProps.data;
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
    
    shouldComponentUpdate(nextProps, nextState):boolean {
        return (nextState.data.length !== this.state.data.length) ||
                this.dyUpdateProps.some((prop) => nextState[prop] !== this.state[prop]);
    }
    
    componentDidUpdate(prevProps, prevState) {
        this.update();
    }

    render() {
        let graphStyle:{width?:number; height?:number} = {};
        if (this.props.width && isFinite(this.props.width))
            graphStyle.width = this.props.width;
        if (this.props.height && isFinite(this.props.height))
            graphStyle.height = this.props.height;

        // don't show the rescale button if there's no data to scale
        let buttonStyle:{display?:string} = {},
            hasData = this.state.data && (this.state.data.length > 1);
        if (!hasData)
            buttonStyle.display = "none";

        return (
            <div style={{position: "relative"}}>
                <div id={"sensor-graph-" + this.props.title} className="graph-box" style={graphStyle}></div>
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
