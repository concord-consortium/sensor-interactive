import * as React from "react";

export interface TitleProps {}

export class Title extends React.Component<TitleProps, undefined> {
    render() {
        return <h2>Sensor Interactive</h2>;
    }
}