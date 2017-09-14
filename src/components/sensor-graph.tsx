import * as React from "react";
import { Sensor } from "../models/sensor";
import { Graph } from "./graph";
import { GraphSidePanel } from "./graph-side-panel";
import { ISensorConfigColumnInfo,
         ISensorConnectorDataset } from "../models/sensor-connector-interface";
import sizeMe from "react-sizeme";

const kSidePanelWidth = 160,
      kPairedGraphHeight = 190,
      kGraphLabelHeight = 18,
      kGraphWithLabelHeight = kPairedGraphHeight + kGraphLabelHeight,
      kBetweenGraphMargin = 10,
      kSingletonGraphHeight = kGraphWithLabelHeight + kBetweenGraphMargin + kPairedGraphHeight;

interface ISizeMeSize {
    width?:number;
    height?:number;
}

export interface SensorGraphProps {
    size:ISizeMeSize;
    sensorConnector:any;
    sensorColumns:ISensorConfigColumnInfo[];
    sensor:Sensor;
    title:string;
    onGraphZoom:(xStart:number, xEnd:number) => void;
    onSensorSelect:(sensorIndex:number, columnID:string) => void;
    onStopCollection:() => void;
    runLength:number;
    collecting:boolean;
    dataReset:boolean;
    xStart:number;
    xEnd:number;
    isSingletonGraph:boolean;
    isLastGraph:boolean;
}

export interface SensorGraphState {
    sensorActive:boolean;
    sensorColID?:string;
    sensorValue:number|undefined;
    sensorData:number[][];
    dataChanged:boolean;
    tareValue:number;
    timeUnit:string;
}

export class SensorGraphImp extends React.Component<SensorGraphProps, SensorGraphState> {
    
    sensor:Sensor;
    lastDataIndex:number = 0;
    
    constructor(props:SensorGraphProps) {
        super(props);
        
        this.state = {
            sensorActive: false,
            sensorColID: undefined,
            sensorValue: undefined,
            sensorData: this.props.sensor.sensorData,
            dataChanged: false,
            tareValue: 0,
            timeUnit: "s"
        };
        
        this.props.sensorConnector.on("statusReceived", this.onSensorStatus);
        this.props.sensorConnector.on("data", this.onSensorData);
    }
    
    componentWillUnmount() {
        this.props.sensorConnector.off("statusReceived", this.onSensorStatus);
        this.props.sensorConnector.off("data", this.onSensorData);
    }
    
    zeroSensor = () => {
        this.setState({
            tareValue: this.state.sensorValue || 0
        });
    }
    
    onSensorStatus = () => {
        // find the value for the currently selected sensor/unit type
        var sensorColumnID = this.props.sensor.columnID,
            dataColumn = sensorColumnID && this.getDataColumn(sensorColumnID),
            liveValue = dataColumn ? Number(dataColumn.liveValue) : undefined;
        if(liveValue != null) {
            this.props.sensor.sensorValue = liveValue;
            this.setState({ sensorValue: liveValue });
        }
        else {
            this.setState({ sensorActive: false, sensorValue: undefined, dataChanged: true });
        }
    }
    
    onSensorData = (setId:string) => {
        if(!this.props.collecting) {
            return;
        }
        
        var dataset:ISensorConnectorDataset|null = null;
        for(var i=0; i < this.props.sensorConnector.datasets.length; i++) {
            if(this.props.sensorConnector.datasets[i].id === setId) {
                dataset = this.props.sensorConnector.datasets[i];
                break;
            }
        }
        if(dataset == null) {
            return;
        }
        
        const timeData = dataset.columns[0].data || [],
              timeDataLength = timeData.length,
              dataColumn = this.getDataColumn(this.props.sensor.columnID, dataset),
              sensorData = (dataColumn && dataColumn.data) || [],
              sensorDataLength = sensorData.length;
        
        // columns aren't always updated together
        var newLength = Math.min(timeDataLength, sensorDataLength);
        
        if (this.lastDataIndex == null) {
            this.lastDataIndex = 0;
        }                    

        // check there's new data for this column
        if (newLength > this.lastDataIndex) {
            var newTimeData = timeData.slice(this.lastDataIndex, newLength);
            var newValueData = sensorData.slice(this.lastDataIndex, newLength);
            var updatedData = this.state.sensorData.slice();
            for(var i=0; i < newTimeData.length; i++) {
                var time = Number(newTimeData[i].toFixed(2));
                var value = newValueData[i] - this.state.tareValue;
                if(time <= this.props.runLength) {
                    updatedData.push([time, value]);
                }
                else if (this.props.onStopCollection) {
                    this.props.onStopCollection();
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
    
    getDataColumn(columnID?:string, dataset?:ISensorConnectorDataset) {
        if(dataset == null) {
            dataset = this.props.sensorConnector.stateMachine.datasets[0];
        }
        var dataColumns = (dataset && dataset.columns) || [];
        for(var i=0; i < dataColumns.length; i++) {
            var dataColumn = dataColumns[i];
            if((columnID != null) && (dataColumn.id === columnID)) {
                return dataColumn;
            }
        }
        console.log("data column not found (" + columnID + ")");
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
    
    renderGraph(graphWidth?:number) {
        const height = this.props.isSingletonGraph
                        ? kSingletonGraphHeight
                        : (this.props.isLastGraph ? kGraphWithLabelHeight : kPairedGraphHeight),
              sensorDefinition = this.props.sensor && this.props.sensor.definition,
              minReading = sensorDefinition && sensorDefinition.minReading,
              maxReading = sensorDefinition && sensorDefinition.maxReading,
              measurementName = (sensorDefinition && sensorDefinition.measurementName) || "",
              valueUnit = this.props.sensor.valueUnit || "",
              xLabel = this.props.isLastGraph ? `Time (${this.state.timeUnit})` : "",
              yLabel = measurementName
                        ? `${measurementName} (${valueUnit})`
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
                xLabel={xLabel}
                yLabel={yLabel} />
            </div>
        );
    }

    renderSidePanel() {
        return (
          <GraphSidePanel
            width={kSidePanelWidth}
            sensor={this.props.sensor}
            sensorColumns={this.props.sensorColumns}
            onZeroSensor={this.zeroSensor}
            onSensorSelect={this.props.onSensorSelect} />
        );
    }
    
    render() {
        const { width } = this.props.size,
              graphWidth = width != null ? width - kSidePanelWidth : undefined;
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
