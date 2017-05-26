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
    xPrecision:number,
    yPrecision:number
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
            xLabel: "Time",
            yLabel: "",
            xPrecision: Format.getAxisPrecision(this.props.xMax - this.props.xMin),
            yPrecision: Format.getAxisPrecision(this.props.yMax - this.props.yMin)
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
            xPrecision: Format.getAxisPrecision(xRange[1] - xRange[0]),
            yPrecision: Format.getAxisPrecision(yRange[1] - yRange[0])
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
                        return Format.formatValue(val, this.state.xPrecision + 1);
                    },
                    axisLabelFormatter: (val:number) => {
                        return Format.formatValue(val, this.state.xPrecision);
                    }
                },
                y: {
                    valueFormatter: (val:number) => {
                        return Format.formatValue(val, this.state.yPrecision + 2);
                    },
                    axisLabelFormatter: (val:number) => {
                        return Format.formatValue(val, this.state.yPrecision);
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
            newState.yPrecision = Format.getAxisPrecision(newState.yMax);
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
                <button id="scaleBtn" style={{position:"absolute", top:0, right:0}} 
                    onClick={this.autoScale}>Auto-scale</button>
                <div id={"sensor-graph-" + this.props.title} className="graph-box"></div>
            </div>
        );
    }
}