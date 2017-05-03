import * as React from "react";

export interface TitleProps {
    sensorType:string
}

export class Title extends React.Component<TitleProps, undefined> {
    render() {
        return <h2>{"Sensor Interactive: " + this.props.sensorType}</h2>;
    }
}