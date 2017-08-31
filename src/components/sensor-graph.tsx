import * as React from "react";
import { Sensor } from "../models/sensor";
import { Graph } from "./graph";
import { GraphSidePanel } from "./graph-side-panel";
import { SensorDefinitions } from "../models/sensor-definitions";
import sizeMe from "react-sizeme";

const kSidePanelWidth = 160,
      kPairedGraphHeight = 190,
      kGraphLabelHeight = 18,
      kGraphWithLabelHeight = kPairedGraphHeight + kGraphLabelHeight,
      kBetweenGraphMargin = 10,
      kSingletonGraphHeight = kGraphWithLabelHeight + kBetweenGraphMargin + kPairedGraphHeight;
      
export interface SensorGraphProps {
    size:any;
    sensorConnector:any;
    sensor:Sensor;
    title:string;
    onGraphZoom:(xStart:number, xEnd:number) => void;
    runLength:number;
    valueUnits:string[];
    collecting:boolean;
    dataReset:boolean;
    xStart:number;
    xEnd:number;
    isSingletonGraph:boolean;
    isLastGraph:boolean;
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

export class SensorGraphImp extends React.Component<SensorGraphProps, SensorGraphState> {
    
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
        
        this.props.sensorConnector.on("statusReceived", this.onSensorStatus);
        this.props.sensorConnector.on("data", this.onSensorData);
    }
    
    componentWillUnmount() {
        this.props.sensorConnector.off("statusReceived", this.onSensorStatus);
        this.props.sensorConnector.off("data", this.onSensorData);
    }
    
    onUnitSelect = (unit:string) => {
        this.setUnit(unit);
    }
    
    setUnit(valueUnit:string) {
        if(valueUnit === this.state.valueUnit) {
            return;
        }
        
        this.props.sensor.definition = SensorDefinitions[valueUnit];
        this.props.sensor.valueUnit = valueUnit;
        
        this.setState({
            valueUnit: valueUnit,
            tareValue: 0
        });
    }
    
    zeroSensor = () => {
        this.setState({
            tareValue: this.state.sensorValue || 0
        });
    }
    
    onSensorStatus = (e:any) => {
        if(!this.state.valueUnit) {
            this.setUnit(this.props.valueUnits[0]);
        }
        
        // find the value for the currently selected sensor/unit type
        var sensorValueUnit = this.props.sensor.valueUnit,
            dataColumn = sensorValueUnit && this.getDataColumn(sensorValueUnit);
        if(dataColumn) {
            this.setState({sensorValue: dataColumn.liveValue});
        }
    }
    
    onSensorData = (setId:string) => {
        if(!this.props.collecting) {
            return;
        }
        
        var dataset;
        for(var i=0; i < this.props.sensorConnector.datasets.length; i++) {
            if(this.props.sensorConnector.datasets[i].id === setId) {
                dataset = this.props.sensorConnector.datasets[i];
                break;
            }
        }
        if(dataset == null) {
            return;
        }
        
        var timeColumn = dataset.columns[0].data;
        var dataColumn = this.getDataColumn(this.props.sensor.valueUnit, dataset);
        var valueColumn = dataColumn && dataColumn.data;
        
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
        if(dataset == null) {
            dataset = this.props.sensorConnector.stateMachine.datasets[0];
        }
        var dataColumns = dataset.columns;
        for(var i=0; i < dataColumns.length; i++) {
            var dataColumn = dataColumns[i];
            if(dataColumn.units === valueUnit) {
                return dataColumn;
            }
        }
        console.log("data column not found (" + valueUnit + ")");
        return null;
    }
    
    componentWillReceiveProps(nextProps:SensorGraphProps) {
        if(!this.props.dataReset && nextProps.dataReset) {
            this.lastDataIndex = 0;
            this.setState({
                sensorData:[]
            });
        }
    }
    
    shouldComponentUpdate(nextProps:SensorGraphProps, nextState:SensorGraphState):boolean {
        if(nextProps.valueUnits) return true;
        return false;
    }

    renderGraph(graphWidth:number) {
        const height = this.props.isSingletonGraph
                        ? kSingletonGraphHeight
                        : (this.props.isLastGraph ? kGraphWithLabelHeight : kPairedGraphHeight),
              sensorDefinition = this.props.sensor && this.props.sensor.definition,
              minReading = sensorDefinition && sensorDefinition.minReading,
              maxReading = sensorDefinition && sensorDefinition.maxReading,
              measurementName = (sensorDefinition && sensorDefinition.measurementName) || "",
              stateValueUnit = this.state.valueUnit || "",
              yLabel = measurementName
                        ? `${measurementName} (${stateValueUnit})`
                        : "Sensor Reading (-)";
        return (
            <div className="sensor-graph">
              <Graph 
                title={this.props.title}
                width={graphWidth}
                height={height}
                data={this.state.sensorData} 
                onZoom={this.props.onGraphZoom}
                xMin={this.props.xStart}
                xMax={this.props.xEnd}
                yMin={minReading != null ? minReading : 0}
                yMax={maxReading != null ? maxReading : 10}
                xLabel={this.props.isLastGraph ? `Time (${this.state.timeUnit})` : ""}
                yLabel={yLabel} />
            </div>
        );
    }

    renderSidePanel() {
        return (
          <GraphSidePanel
            width={kSidePanelWidth}
            sensorDefinition={this.props.sensor.definition}
            sensorValue={this.state.sensorValue}
            sensorTareValue={this.state.tareValue}
            sensorUnit={this.state.valueUnit}
            sensorUnits={this.props.valueUnits}
            onZeroSensor={this.zeroSensor}
            onSensorChange={this.onUnitSelect} />
        );
    }
    
    render() {
        const { width } = this.props.size,
              graphWidth = width - kSidePanelWidth;
        return (
            <div className="sensor-graph-panel">
                {this.renderGraph(graphWidth)}
                {this.renderSidePanel()}
            </div>
        );
    }
}

const sizeMeConfig = {
        monitorWidth: true,
        noPlaceholder: true
      };
export const SensorGraph = sizeMe(sizeMeConfig)(SensorGraphImp);
