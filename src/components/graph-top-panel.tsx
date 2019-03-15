import * as React from "react";
import { Format } from "../utils/format";
import { SensorSlot } from "../models/sensor-slot";
import { SensorDefinitions } from "../models/sensor-definitions";
import { SensorConfigColumnInfo } from "@concord-consortium/sensor-connector-interface";
import Button from "./smart-highlight-button";
import Select from "./smart-highlight-select";

interface IGraphTopPanelProps {
  sensorSlot:SensorSlot;
  sensorColumns:SensorConfigColumnInfo[];
  sensorPrecision:number;
  onSensorSelect?:(sensorIndex:number, columnID:string) => void;
  onZeroSensor?:() => void;
  onRemoveSensor?:() => void;
  showRemoveSensor:boolean;
}

export const GraphTopPanel: React.SFC<IGraphTopPanelProps> = (props) => {
  const { sensorSlot, onZeroSensor, onRemoveSensor, onSensorSelect } = props,
        { sensor } = sensorSlot,
        tareValue = sensor.tareValue || 0,
        sensorUnitStr = sensor.valueUnit || "";

  const handleZeroSensor = () => {
    if (onZeroSensor)
      onZeroSensor();
  };

  const handleRemoveSensor = () => {
    if (onRemoveSensor)
      onRemoveSensor();
  };

  const handleSensorSelect = (evt:React.FormEvent<HTMLSelectElement>) => {
    if (onSensorSelect && (props.sensorSlot.slotIndex != null)) {
      const selectedColID = evt.currentTarget.value;
      onSensorSelect(props.sensorSlot.slotIndex, selectedColID);
    }
  };

  const sensorReading = () => {
    const sensorValue = sensor && sensor.sensorValue;
    if ((sensorValue == null) || isNaN(sensorValue))
      return "";

    const { sensorPrecision } = props,
          reading = Format.formatFixedValue(sensorValue - tareValue, sensorPrecision);
    return (sensorUnitStr) ? `${reading} ${sensorUnitStr}` : reading;
  };

  const sensorSelectOptions = (sensorColumns:SensorConfigColumnInfo[]) => {
    const columns = sensorColumns || [];
    // if no sensor slot or not enough sensors, there are no options
    if ((sensorSlot.slotIndex == null) || (sensorSlot.slotIndex >= columns.length)) return null;
    return columns.map((column:SensorConfigColumnInfo, index:number) => {
      const units = column && column.units,
            columnID = column && column.id,
            sensorDef = units && SensorDefinitions[units],
            measurementName = sensorDef && sensorDef.measurementName;
      if (!measurementName) return null;

      const measurementNameWithUnits = units
                                        ? `${measurementName} (${units}) [${index+1}]`
                                        : measurementName;
      return (<option key={units+String(index)} value={columnID}>{measurementNameWithUnits}</option>);
    });
  };

  const sensorOptions = sensorSelectOptions(props.sensorColumns),
        enableSensorSelect = sensorOptions && (sensorOptions.length > 1) && props.onSensorSelect,
        sensorDefinition = sensor && sensor.definition,
        enableZeroSensor = sensorDefinition && sensorDefinition.tareable && props.onZeroSensor;
  return (
    <div className="graph-top-panel">
      <Select className="sensor-select"
              value={sensor.columnID}
              disabled={!enableSensorSelect}
              onChange={handleSensorSelect} >
        {sensorOptions}
      </Select>
      <div className="reading-container">
        <label className="reading-label">Reading</label>
        <label className="sensor-reading">{sensorReading()}</label>
      </div>
      <Button className="zero-button"
              onClick={handleZeroSensor} disabled={!enableZeroSensor}>
        Zero Sensor
      </Button>
      {props.showRemoveSensor ?
        <Button className="remove-sensor-button"
                onClick={handleRemoveSensor}>
          <svg className="icon remove">
            <use xlinkHref="../assets/images/icons.svg#icon-remove"/>
          </svg>
        </Button>
        : null }
    </div>
  );
};
