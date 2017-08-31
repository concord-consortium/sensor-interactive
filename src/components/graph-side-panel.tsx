import * as React from "react";
import { Format } from "../utils/format";
import { SensorDefinitions } from "../models/sensor-definitions";

interface IGraphSidePanelProps {
  width?:number;
  sensorDefinition:any;
  sensorValue?:number;
  sensorTareValue?:number;
  sensorUnit:string;
  sensorUnits:string[];
  onZeroSensor:() => void;
  onSensorChange:(sensorType:string) => void;
}

export const GraphSidePanel: React.SFC<IGraphSidePanelProps> = (props) => {
  const { sensorDefinition, sensorValue, sensorTareValue, sensorUnit, sensorUnits,
          onZeroSensor, onSensorChange } = props,
        tareValue = sensorTareValue || 0,
        sensorUnitStr = sensorUnit || "";
  
  const handleZeroSensor = () => {
    if (onZeroSensor)
      onZeroSensor();
  };

  const handleSensorChange = (evt:React.FormEvent<HTMLSelectElement>) => {
    if (onSensorChange)
      onSensorChange(evt.currentTarget.value);
  };

  const sensorReading = () => {
    if (!sensorDefinition || (sensorValue == null) || isNaN(sensorValue))
      return "";

    const sensorRange = sensorDefinition.maxReading - sensorDefinition.minReading,
          sensorPrecision = Format.getFixValue(sensorRange),
          reading = Format.formatFixedValue(sensorValue - tareValue, sensorPrecision);
    return (sensorUnitStr) ? `${reading} ${sensorUnitStr}` : reading;
  };

  const sensorUnitOptions = (sensorUnits) => {
    return (sensorUnits || []).map((unit) => {
      const sensorDef = unit && SensorDefinitions[unit],
            measurementName = sensorDef && sensorDef.measurementName;
      if (!measurementName) return null;

      const measurementNameWithUnits = unit
                                        ? `${measurementName} (${unit})`
                                        : measurementName;
      return (<option key={unit} value={unit}>{measurementNameWithUnits}</option>);
    });
  };

  const width = props.width && isFinite(props.width) ? props.width : null,
        style = width ? { flex: `0 0 ${width}px` } : {},
        disableZeroSensor = !sensorDefinition || !sensorDefinition.tareable;
  return (
    <div className="graph-side-panel" style={style}>
      <label className="reading-label side-panel-item">Reading:</label>
      <label className="sensor-reading side-panel-item">{sensorReading()}</label>
      <label className="sensor-label side-panel-item">Sensor:</label>
      <select className="sensor-select side-panel-item" onChange={handleSensorChange} defaultValue={sensorUnitStr}>
        {sensorUnitOptions(sensorUnits)}
      </select>
      <button className="zero-button side-panel-item" onClick={handleZeroSensor} disabled={disableZeroSensor}>
        Zero Sensor
      </button>
    </div>
  );
};
