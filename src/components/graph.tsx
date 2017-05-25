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
            xPrecision: Format.getFixValue(this.props.xMax - this.props.xMin),
            yPrecision: Format.getFixValue(this.props.yMax - this.props.yMin)
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
        console.log("graph.update")
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
            xPrecision: Format.getFixValue(xRange[1] - xRange[0]),
            yPrecision: Format.getFixValue(yRange[1] - yRange[0])
        });
        console.log("zoom:")
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
                        return Format.formatValue(val, this.state.xPrecision);
                    },
                    axisLabelFormatter: (val:number) => {
                        return Format.formatValue(val, this.state.xPrecision);
                    }
                },
                y: {
                    valueFormatter: (val:number) => {
                        return Format.formatValue(val, this.state.yPrecision);
                    },
                    axisLabelFormatter: (val:number) => {
                        return Format.formatValue(val, this.state.yPrecision);
                    }
                }
            },
            xlabel: this.state.xLabel,
            ylabel: this.state.yLabel
        });
    }

    componentWillReceiveProps(nextProps:GraphProps) {
        var data = this.checkData(nextProps.data);
        
        var newState:any = {};
        var updateProps = ["xMin", "xMax", "yMin", "yMax", "xLabel", "yLabel"];
        updateProps.forEach((prop)=> {
            if(nextProps[prop] != this.props[prop]) {
                console.log("prop: " + prop + ", old: " + this.props[prop] + ", new: " + nextProps[prop]);
            
                newState[prop] = nextProps[prop];
            }
        });
        
        if(nextProps.data.length != this.state.data.length) {
            newState.data = nextProps.data;
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
                <div id={"sensor-graph-" + this.props.title}></div>
            </div>
        );
    }
}