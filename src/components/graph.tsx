import * as React from "react";
import Dygraph from "dygraphs";

export interface GraphProps {
    data:(number|Date)[][],
    onZoom:Function,
    xMax:number
}

export interface GraphState {
    data:(number|Date)[][],
    xMax:number
}

export class Graph extends React.Component<GraphProps, GraphState> {
    
    private dygraph:Dygraph;
    private lastLabel:number = 0;
    
    constructor(props: GraphProps) {
        super(props);
        
        this.state = {
            data: this.props.data,
            xMax: 10000
        }
    }
    
    // TODO: remove redundant calls
    checkData(data:(number|Date)[][]):(number|Date)[][] {
        if(data.length == 0) {
            data = [[new Date(0),0]];
        }
        return data;
    }
    
    update():void {
        var data = this.checkData(this.state.data);
        this.dygraph.updateOptions({
            file: data,
            dateWindow: [new Date(0), new Date(this.state.xMax)]
        });
    }
    }
    
    componentDidMount() {
        var data = this.checkData(this.state.data);
        
        function formatDate(x:Date):string {
            if(!x.getSeconds) {
                x = new Date(x);
            }
            return x.getSeconds() + "." + x.getMilliseconds();
        }
        
        this.dygraph = new Dygraph("sensor-graph", data, {
            dateWindow: [0, new Date(this.props.xMax)],
            zoomCallback: this.props.onZoom,
            axes: {
                x: {
                    valueFormatter: function (val:Date) {
                        return formatDate(val);
                    },
                    axisLabelFormatter: function (val:Date) {
                        return formatDate(val);
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
            <div id="sensor-graph">
            </div>
        );
    }
}