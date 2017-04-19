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
    
    update():void {
        this.dygraph.updateOptions({'file':this.props.data});
    }
    
    componentDidMount() {
        this.dygraph = new Dygraph("sensor-graph", this.state.data);
    }
    
    componentWillReceiveProps(nextProps:GraphProps) {
        this.setState({
            data:nextProps.data
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