import * as React from "react";
import { Sensor } from "./sensor";
import { Graph } from "./graph";
import { SensorStrings, SensorDefinitions } from "./sensor-definitions";
import { Format } from "./format";
import SensorConnectorInterface from "@concord-consortium/sensor-connector-interface";


export interface SensorGraphProps {
    sensorConnector:SensorConnectorInterface,
    sensor:Sensor,
    title:string,
    onGraphZoom:Function,
    runLength:number,
    valueUnits:string[],
    collecting:boolean,
    dataReset:boolean,
    xStart:number,
    xEnd:number
}

export interface SensorGraphState {
    sensorActive:boolean;
    sensorValue:number|undefined;
    sensorData:number[][];
    dataChanged:boolean;
    tareValue:number;
    timeUnit:string;
    valueUnit:string;
}

export class SensorGraph extends React.Component<SensorGraphProps, SensorGraphState> {
    
    sensor:Sensor;
    lastDataIndex:number = 0;
    
    constructor(props:SensorGraphProps) {
        super(props);
        
        this.state = {
            sensorActive: false,
            sensorValue: undefined,
            sensorData: this.props.sensor.sensorData,
            dataChanged: false,
            tareValue: 0,
            timeUnit: "s",
            valueUnit: this.props.sensor.valueUnit
        };
        
        this.onUnitSelect = this.onUnitSelect.bind(this);
        this.zeroSensor = this.zeroSensor.bind(this);
        this.onSensorStatus = this.onSensorStatus.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        
        this.props.sensorConnector.on("statusReceived", this.onSensorStatus);
        this.props.sensorConnector.on("data", this.onSensorData);
    }
    
    componentWillUnmount() {
        this.props.sensorConnector.off("statusReceived", this.onSensorStatus);
        this.props.sensorConnector.off("data", this.onSensorData);
    }
    
    onUnitSelect(event:React.FormEvent<HTMLSelectElement>) {
        this.setUnit(event.currentTarget.value);
    }
    
    setUnit(valueUnit:string) {
        if(valueUnit == this.state.valueUnit) {
            return;
        }
        
        this.props.sensor.definition = SensorDefinitions[valueUnit];
        this.props.sensor.valueUnit = valueUnit;
        
        this.setState({
            valueUnit: valueUnit,
            tareValue: 0
        });
    }
    
    zeroSensor() {
        this.setState({
            tareValue: this.state.sensorValue || 0
        });
    }
    
    onSensorStatus(e) {
        if(!this.state.valueUnit) {
            this.setUnit(this.props.valueUnits[0]);
        }
        
        // find the value for the currently selected sensor/unit type
        var dataColumn = this.getDataColumn(this.props.sensor.valueUnit);
        if(dataColumn) {
            this.setState({sensorValue: dataColumn.liveValue});
        }
    }
    
    onSensorData(setId:string) {
        if(!this.props.collecting) {
            return;
        }
        
        var dataset;
        for(var i=0; i < this.props.sensorConnector.datasets.length; i++) {
            if(this.props.sensorConnector.datasets[i].id == setId) {
                dataset = this.props.sensorConnector.datasets[i];
                break;
            }
        }
        if(dataset == undefined) {
            return;
        }
        
        var timeColumn = dataset.columns[0].data;
        var valueColumn = this.getDataColumn(this.props.sensor.valueUnit, dataset).data;
        
        // columns aren't always updated together
        var newLength = Math.min(timeColumn.length, valueColumn.length);
        
        if (this.lastDataIndex === undefined) {
            this.lastDataIndex = 0;
        }                    

        // check there's new data for this column
        if (newLength > this.lastDataIndex) {
            var newTimeData = timeColumn.slice(this.lastDataIndex, newLength);
            var newValueData = valueColumn.slice(this.lastDataIndex, newLength);
            var updatedData = this.state.sensorData.slice();
            for(var i=0; i < newTimeData.length; i++) {
                var time = Number(newTimeData[i].toFixed(2));
                var value = newValueData[i] - this.state.tareValue;
                if(time <= this.props.runLength) {
                    updatedData.push([time, value]);
                }
            }
            
            this.props.sensor.sensorData = updatedData;
            this.setState({
                sensorData: updatedData,
                dataChanged: true
            });
            
            this.lastDataIndex = newLength;
        }
    }
    
    getDataColumn(valueUnit:string, dataset?:any) {
        if(dataset == undefined) {
            dataset = this.props.sensorConnector.stateMachine.datasets[0];
        }
        var dataColumns = dataset.columns;
        for(var i=0; i < dataColumns.length; i++) {
            var dataColumn = dataColumns[i];
            if(dataColumn.units == valueUnit) {
                return dataColumn;
            }
        }
        console.log("data column not found (" + valueUnit + ")");
        return null;
    }
    
    componentWillReceiveProps(nextProps) {
        if(!this.props.dataReset && nextProps.dataReset) {
            this.lastDataIndex = 0;
            this.setState({
                sensorData:[]
            })
        }
    }
    
    shouldComponentUpdate(nextProps, nextState):boolean {
        if(nextProps.valueUnits) return true;
        return false;
    }
    
    renderReading() {
        var reading = "";
        if(this.state.sensorValue) {
            reading = Format.formatValue(
                this.state.sensorValue - this.state.tareValue, Format.getPrecision(this.props.sensor.definition.maxReading - this.props.sensor.definition.minReading));
        }
        
        var valueOption = function(valueUnit:string) {
            var sensorDef = SensorDefinitions[valueUnit];
            if(!sensorDef) {
                return null;
            }
            var measurementName = sensorDef.measurementName;
            var jsx = <option key={valueUnit} value={valueUnit}>
                    {measurementName + " ("+valueUnit+")"}</option>;
            return jsx;
        }
        
        return <div className="sensor-reading">
                    <label>Reading:</label>
                    {this.props.sensor.definition ? 
                    <span>{reading + " " + this.state.valueUnit}</span> : null}
                    <button id="zeroBtn" onClick={this.zeroSensor}>Zero</button>
                    <span>Sensor:</span>
                    <select onChange={ this.onUnitSelect } defaultValue={this.state.valueUnit}>
                        {this.props.valueUnits.map(valueOption, this)}
                    </select>
                </div>;
    }
    
    render() {
        
        return (
            <div className="sensor-graph">
                {this.renderReading()}
                <Graph 
                   title={this.props.title}
                   data={this.state.sensorData} 
                   onZoom={this.props.onGraphZoom}
                   xMin={this.props.xStart}
                   xMax={this.props.xEnd}
                   yMin={this.props.sensor.definition.minReading}
                   yMax={this.props.sensor.definition.maxReading}
                   xLabel={"Time (" + this.state.timeUnit + ")"} 
                   yLabel={this.props.sensor.definition.measurementName + " (" + this.state.valueUnit + ")"}/>
            </div>
        );
            
    }
}