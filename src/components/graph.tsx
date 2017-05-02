import * as React from "react";
import Dygraph from "dygraphs";

export interface GraphProps {
    data:number[][],
    onZoom:Function,
    xMax:number
}

export interface GraphState {
    data:number[][],
    xMax:number
}

export class Graph extends React.Component<GraphProps, GraphState> {
    
    private dygraph:Dygraph;
    private lastLabel:number = 0;
    
    constructor(props: GraphProps) {
        super(props);
        
        this.state = {
            data: this.props.data,
            xMax: 10
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
        var data = this.checkData(this.state.data);
        this.dygraph.updateOptions({
            file: data,
            dateWindow: [0, this.state.xMax]
        });
    }

    autoScale() {
        this.dygraph.resetZoom();
    }
    
    componentDidMount() {
        var data = this.checkData(this.state.data);
        
        function formatTime(x:number):string {
            return x + " s";
        }
        
        this.dygraph = new Dygraph("sensor-graph", data, {
            dateWindow: [0, this.state.xMax],
            zoomCallback: this.props.onZoom,
            axes: {
                x: {
                    valueFormatter: function (val:number) {
                        return formatTime(val);
                    },
                    axisLabelFormatter: function (val:number) {
                        return formatTime(val);
                    }
                }
            }
        });
    }

    componentWillReceiveProps(nextProps:GraphProps) {
        var data = this.checkData(nextProps.data);
        var newState:any = {}
        if(nextProps.xMax != this.props.xMax) {
            newState.xMax = nextProps.xMax;
        }
        if(nextProps.data.length != this.state.data.length) {
            newState.data = nextProps.data;
        }
        this.setState(newState);
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