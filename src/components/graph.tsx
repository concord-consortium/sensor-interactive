import * as React from "react";
import Dygraph from "dygraphs";
import { Format } from "./format";

export interface GraphProps {
    title:string|undefined,
    data:number[][],
    onZoom:Function,
    xMin:number,
    xMax:number,
    yMin:number,
    yMax:number,
    xLabel:string|undefined,
    yLabel:string|undefined
}

export interface GraphState {
    data:number[][],
    xMin:number,
    xMax:number,
    yMin:number,
    yMax:number,
    xLabel:string|undefined,
    yLabel:string|undefined,
    xFix:number,
    yFix:number,
    xAxisFix:number,
    yAxisFix:number
}

export class Graph extends React.Component<GraphProps, GraphState> {
    
    private dygraph:Dygraph;
    private lastLabel:number = 0;
    
    constructor(props: GraphProps) {
        super(props);
        
        this.state = {
            data: this.props.data,
            xMin: this.props.xMin,
            xMax: this.props.xMax,
            yMin: this.props.yMin,
            yMax: this.props.yMax,
            xLabel: "",
            yLabel: "",
            xFix: Format.getFixValue(this.props.xMax - this.props.xMin),
            yFix: Format.getFixValue(this.props.yMax - this.props.yMin),
            xAxisFix: Format.getAxisFix(this.props.xMax - this.props.xMin),
            yAxisFix: Format.getAxisFix(this.props.yMax - this.props.yMin),
        }
        
        this.autoScale = this.autoScale.bind(this);
        this.onZoom = this.onZoom.bind(this);
    }
    
    // TODO: remove redundant calls
    checkData(data:number[][]):number[][] {
        if(data.length == 0) {
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
    }

    autoScale() {
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
        var updateProps = ["xMin", "xMax", "yMin", "yMax", "xLabel", "yLabel"];
        updateProps.forEach((prop)=> {
            if(nextProps[prop] != this.props[prop]) {
                newState[prop] = nextProps[prop];
            }
        });
        
        if(nextProps.data.length != this.state.data.length) {
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
        if(nextState.data.length != this.state.data.length ||
          nextState.xMax != this.state.xMax ||
          nextState.xLabel != this.state.xLabel ||
          nextState.yLabel != this.state.yLabel) {
            return true;
        }
        return false;
    }
    
    componentDidUpdate(prevProps, prevState) {
        this.update();
    }

    render() {
        return (
            <div>
                <a onClick={this.autoScale}
                    className="graph-button"
                    title="Show all data (autoscale)"><i className="fa fa-arrows"></i></a>
                <div id={"sensor-graph-" + this.props.title} className="graph-box"></div>
            </div>
        );
    }
}