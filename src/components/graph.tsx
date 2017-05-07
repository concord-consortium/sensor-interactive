import * as React from "react";
import Dygraph from "dygraphs";

export interface GraphProps {
    data:number[][],
    onZoom:Function,
    xMax:number,
    yMin:number,
    yMax:number,
    xLabel:string|undefined,
    yLabel:string|undefined
}

export interface GraphState {
    data:number[][],
    xMax:number,
    yMin:number,
    yMax:number,
    xLabel:string|undefined,
    yLabel:string|undefined
}

export class Graph extends React.Component<GraphProps, GraphState> {
    
    private dygraph:Dygraph;
    private lastLabel:number = 0;
    
    constructor(props: GraphProps) {
        super(props);
        
        this.state = {
            data: this.props.data,
            xMax: 10,
            yMin: 0,
            yMax: 10,
            xLabel: "Time",
            yLabel: ""
        }
        
        this.autoScale = this.autoScale.bind(this);
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
    
    componentDidMount() {
        var data = this.checkData(this.state.data);
        
        function formatVal(x:number, unit:string=""):string {
            return x.toFixed(2) + " " + unit;
        }
        
        this.dygraph = new Dygraph("sensor-graph", data, {
            dateWindow: [0, this.state.xMax],
            zoomCallback: this.props.onZoom,
            axes: {
                x: {
                    valueFormatter: (val:number) => {
                        return formatVal(val);
                    },
                    axisLabelFormatter: (val:number) => {
                        return formatVal(val);
                    }
                },
                y: {
                    valueFormatter: (val:number) => {
                        return formatVal(val);
                    },
                    axisLabelFormatter: (val:number) => {
                        return formatVal(val);
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
        
        if(nextProps.xLabel != this.props.xLabel) {
            newState.xLabel = nextProps.xLabel,
            newState.yLabel = nextProps.yLabel,
            newState.yMin = nextProps.yMin,
            newState.yMax = nextProps.yMax
        }
        if(nextProps.xMax != this.props.xMax) {
            newState.xMax = nextProps.xMax;
        }
        if(nextProps.data.length != this.state.data.length) {
            newState.data = nextProps.data;
        }
        if(newState.xMax || newState.data || newState.xLabel) {
            this.setState(newState);
        }
    }
    
    shouldComponentUpdate(nextProps, nextState):boolean {
        if(nextState.data.length != this.state.data.length ||
          nextState.xMax != this.state.xMax ||
          nextState.xLabel != this.state.xLabel) {
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
                <div id="sensor-graph"></div>
            </div>
        );
    }
}