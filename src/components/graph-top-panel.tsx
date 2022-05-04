import * as React from "react";
import { Format } from "../utils/format";
import { SensorSlot } from "../models/sensor-slot";
import { SensorDefinitions } from "../models/sensor-definitions";
import { SensorConfigColumnInfo } from "@concord-consortium/sensor-connector-interface";
import Button from "./smart-highlight-button";
import Select from "./smart-highlight-select";
import {DeleteIcon} from "./delete-icon";
interface IGraphTopPanelProps {
  sensorSlot:SensorSlot;
  sensorColumns:SensorConfigColumnInfo[];
  sensorPrecision:number;
  sensorUnit:string|null;
  onSensorSelect?:(sensorIndex:number, columnID:string) => void;
  onZeroSensor?:() => void;
  onRemoveSensor?:() => void;
  showRemoveSensor:boolean;
  assetsPath: string;
  readingPaused: boolean;
}

export const GraphTopPanel: React.FC<IGraphTopPanelProps> = (props) => {
  const { sensorSlot, onZeroSensor, onRemoveSensor, onSensorSelect, readingPaused } = props,
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
    if (readingPaused) {
      return "Paused";
    }

    const sensorValue = sensor && (sensor.sensorHeartbeatValue || sensor.sensorValue);
    if ((sensorValue == null) || isNaN(sensorValue))
      return "";

    const { sensorPrecision } = props,
          reading = Format.formatFixedValue(sensorValue - tareValue, sensorPrecision);
    return (sensorUnitStr) ? `${reading} ${sensorUnitStr}` : reading;
  };

  const sensorSelectOptions = (sensorColumns:SensorConfigColumnInfo[]) => {
    const columns = sensorColumns || [];
    const {sensorUnit} = props;
    // if no sensor slot or not enough sensors, there are no options
    if ((sensorSlot.slotIndex == null) || (sensorSlot.slotIndex >= columns.length)) return null;

    const viableColumns = columns.filter((column:SensorConfigColumnInfo) => {
      if(sensorUnit === null) return true;
      const units = column && column.units;
      return (units == sensorUnit);
    });
    // If there are no matching columns, there are no options, display an error:
    if(viableColumns.length === 0) {
      console.warn("No matching columns found for sensor unit:", sensorUnit);
      const message = `No sensors available for ${sensorUnit}`;
      return ([<option key="no-sensor-units" value={message}>{message}</option>]);
    }

    return viableColumns.map((column:SensorConfigColumnInfo, index:number) => {
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

  const sensorOptions = sensorSelectOptions(props.sensorColumns);
  const enableSensorSelect =
    sensorOptions && (sensorOptions.length > 1) && props.onSensorSelect;
  const sensorDefinition = sensor && sensor.definition;
  const enableZeroSensor =
    sensorDefinition && sensorDefinition.tareable && props.onZeroSensor;
  const selectClass =
    "sensor-select " + (sensorOptions && sensorOptions.length <=1 ? "single" : null);


  return (
    <div className="graph-top-panel">
      <Select className={selectClass}
              value={sensor.columnID}
              disabled={!enableSensorSelect}
              onChange={handleSensorSelect}>
        {sensorOptions}
      </Select>
      <div className="reading-container">
        <label className="reading-label">Reading</label>
        <label className="sensor-reading">{sensorReading()}</label>
      </div>
      <Button className="zero-button"
              onClick={handleZeroSensor}
              disabled={!enableZeroSensor}>
        Zero Sensor
      </Button>
      {props.showRemoveSensor ?
        <Button className="remove-sensor-button"
                onClick={handleRemoveSensor}>
          <DeleteIcon />
        </Button>
        : null }
    </div>
  );
};
