import * as React from "react";
import Dygraph from "dygraphs";

export interface GraphProps {
    data:number[][]
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
        this.dygraph = new Dygraph("sensor-graph", data);
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