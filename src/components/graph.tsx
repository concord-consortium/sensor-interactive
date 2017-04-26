import * as React from "react";
import Dygraph from "dygraphs";

export interface GraphProps {
    data:number[][],
    onZoom:Function
}

export interface GraphState {
    data:number[][]
}

export class Graph extends React.Component<GraphProps, GraphState> {
    
    private dygraph:Dygraph;
    private lastLabel:number = 0;
    
    constructor(props: GraphProps) {
        super(props);
        
        this.state = {
            data: this.props.data
        }
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
        this.dygraph.updateOptions({'file':data});
    }
    
    componentDidMount() {
        var data = this.checkData(this.state.data);
        this.dygraph = new Dygraph("sensor-graph", data, {
            zoomCallback:(minX:number, maxX:number, yRange:number) => {
                
                console.log("zoom: " + minX + " -> " + maxX);
                this.props.onZoom(Math.ceil(minX), Math.floor(maxX));
            }
        });
    }
    
    componentWillReceiveProps(nextProps:GraphProps) {
        var data = this.checkData(nextProps.data);
        this.setState({
            data:data
        });
        this.update();
    }
    
    render() {
        return (
            <div id="sensor-graph">
            </div>
        );
    }
}