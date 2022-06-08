// from concord-consortium/lab

import { SensorDefinition } from "@concord-consortium/sensor-connector-interface";

export interface IStringMap {
  [key:string]: string;
}

export interface ISensorStrings {
  [key:string]: string|IStringMap;
}

/* eslint-disable max-len */

export const SensorStrings:ISensorStrings = {
    "select_sensor": "Select Sensor",
    "select_sensor_type": "Select type of sensor...",
    "reading": "Reading:",
    "zero": "Zero",
    "zeroing": "Zeroing...",
    "loading_sensor": "Loading sensor...",
    "choose_sensor_title": "Select a sensor:",
    "connect": "Connect",
    "address_labquest2": "address of LabQuest2",
    "messages": {
      "ready": "Ready to collect.",
      "ready_nocontrol": "Please stop the __controlling_client__ data collector to collect data here.",
      "ready_nocontrol_noname": "Please stop the other active data collector to collect data here.",
      "not_responding": "SensorConnector not responding",
      "appears_stuck": "SensorConnector appears to be stuck",
      "no_sensors": "No sensors connected.",
      "no_device_connected": "No devices connected.",
      "no_devices": "No devices plugged in.",
      "not_connected": "Not connected.",
      "connecting": "Connecting...",
      "connection_in_progress": "Connecting to your sensors. If a message comes up about sensorconnector.concord.org, please accept it.",
      "connection_failed": "Connection failed. __retry_link__",
      "connection_failed_retry_link_text": "Try again",
      "connection_failed_alert": "The Concord Consortium Sensor Connector is not installed or is not running. Please __click_here_link__ for instructions on using the Sensor Connector.",
      "connection_failed_labquest2_alert": "Could not connect to the LabQuest2. Please make sure the address is correct and that the LabQuest2 can be reached from this computer",
      "tare_labquest2_alert": "The LabQuest2 needs to be collecting live data in order to zero. Either set up a new run on the LabQuest2, or click the meter icon in the upper left.",
      "click_here": "click here",
      "interface_connected": "__interface__ connected.",
      "connected": "Connected.",
      "connected_start_labquest2": "Connected. Press start on your LabQuest2 to begin.",
      "connected_start_sensorconnector": "Please stop the __controlling_client__ data collector to collect data here.",
      "connected_start_sensorconnector_noname": "Please stop the other active data collector to collect data here.",
      "starting_data_collection": "Starting data collection...",
      "error_starting_data_collection": "Error starting data collection.",
      "error_starting_data_collection_alert": "Could not start data collection. Make sure that (remote starting) is enabled",
      "collecting_data": "Collecting data.",
      "collecting_data_stop_labquest2": "Collecting data. Press stop on your LabQuest2 to end.",
      "collecting_data_stop_sensorconnector": "Collecting data.",
      "no_data": "No data is available.",
      "no_data_alert": "The Sensor Connector does not appear to be reporting data for the plugged-in device",
      "no_data_labquest2_alert": "The LabQuest does not appear to be reporting data for the plugged-in device",
      "canceling_data_collection": "Canceling data collection...",
      "error_canceling_data_collection": "Error canceling data collection.",
      "error_canceling_data_collection_alert": "Could not cancel data collection. Make sure that (remote starting) is enabled",
      "stopping_data_collection": "Stopping data collection...",
      "error_stopping_data_collection": "Error stopping data collection.",
      "error_stopping_data_collection_alert": "Could not stop data collection. Make sure that (remote starting) is enabled",
      "data_collection_stopped": "Data collection stopped.",
      "data_collection_complete": "Data collection complete.",
      "disconnected": "Disconnected.",
      "unexpected_error": "There was an unexpected error when connecting to the sensor.",
      "sensor_connector_not_responding": "The SensorConnector application is not responding. To continue data collection click the \"Launch SensorConnector\" button.",
      "sensor_not_attached": "No sensors appear to be attached. Try attaching one or more sensors and then click \"Try Again\".",
      "sensor_or_device_unplugged": "The __sensor_or_device_name__ was unplugged. Try plugging it back in, and then click \"$t(sensor.messages.try_again)\".",
      "try_again": "Try Again",
      "cancel": "Cancel",
      "check_save": "Pressing New Run without pressing Save Data will discard the current data. Set up a new run without saving the data first?",
      "bluetooth_connection_failed": "Failed to connect to Bluetooth sensor. Try connecting to the sensor again. If the problem persists, try restarting the sensor, refreshing your browser, unpairing and repairing the sensor, or turning your system's Bluetooth off and then on.",
      "sensor_disconnection_warning": "Bluetooth sensor disconnection detected. Check Bluetooth sensor power and battery level before attempting reconnection.",
      "connection_message": "Connect A Device:",
      "connection_sub_message": "with one or more sensors",
      "about_message": "Use Sensor Interactive to collect and view data from your sensor devices.",
    },
    "measurements": {
      "sensor_reading": "Sensor Reading",
      "time": "Time",
      "distance": "Distance",
      "acceleration": "Acceleration",
      "altitude": "Altitude",
      "angle": "Angle",
      "CO2": "CO₂",
      "CO2_concentration": "CO₂ Concentration",
      "charge": "Charge",
      "conductivity": "Conductivity",
      "current": "Current",
      "dissolved_oxygen": "DO",
      "flow_rate": "Flow Rate",
      "fluorescence_405_nm": "Fluorescence 405 nm",
      "fluorescence_500_nm": "Fluorescence 500 nm",
      "force": "Force",
      "intensity": "Intensity",
      "light_level": "Light Level",
      "light_intensity": "Light Intensity",
      "magnetic_field": "Magnetic Field",
      "position": "Position",
      "potential": "Potential",
      "pressure": "Pressure",
      "relative_humidity": "Relative Humidity",
      "signal": "Signal",
      "sound_level": "Sound Level",
      "speed": "Speed",
      "temperature": "Temperature",
      "transmittance": "Transmittance",
      "turbidity": "Turbidity",
      "UV_intensity": "UV Intensity",
      "velocity": "Velocity",
      "volume": "Volume",
      "pH": "pH",
      "acidity": "Acidity",
      "O2_concentration": "O₂ Concentration",
      "angular_velocity": "Angular Velocity",
      "wind_speed": "Wind Speed",
      "wind_direction": "Wind Direction",
      "wind_chill": "Wind Chill",
      "heat_index": "Heat Index",
      "dew_point": "Dew Point",
      "absolute_humidity": "Absolute Humidity",
      "station_pressure": "Station Pressure",
      "barometric_pressure": "Barometric Pressure"
    },
    "names": {
      "sensor": "sensor",
      "no_sensor": "(no sensor)",
      "light": "Light",
      "motion": "Motion",
      "accelerometer": "Accelerometer",
      "dissolved_oxygen": "Dissolved Oxygen",
      "pressure": "Pressure",
      "charge_sensor": "Charge Sensor",
      "voltage": "Voltage",
      "pH": "pH",
      "CO2_gas": "CO₂ Gas",
      "colorimeter": "Colorimeter",
      "conductivity": "Conductivity",
      "current": "Current",
      "temperature": "Temperature",
      "force": "Force",
      "anemometer": "Anemometer",
      "hand_dynamometer": "Hand Dynamometer",
      "heart_rate": "Heart Rate",
      "magnetic_field": "Magnetic Field",
      "rotary_motion": "Rotary Motion",
      "relative_humidity": "Relative Humidity",
      "linear_position_sensor": "Linear Position Sensor",
      "sound_level": "Sound Level",
      "spectrophotometer": "Spectrophotometer",
      "spirometer": "Spirometer",
      "turbidity": "Turbidity",
      "UV_sensor": "UV Sensor",
      "drop_counter": "Drop Counter",
      "altitude": "Altitude",
      "goMotion": "GoMotion",
      "goTemp": "GoIO Temperature Sensor",
      "goLinkTemperature": "GoIO Temperature Sensor",
      "goLinkLight": "GoIO Light Sensor",
      "goLinkForce": "GoIO Force Sensor",
      "goLinkPH": "GoIO pH Sensor",
      "goLinkCO2": "GoIO CO₂ sensor",
      "goLinkO2": "GoIO O₂ sensor",
      "labQuestMotion": "LabQuest Motion Sensor",
      "labQuestTemperature": "LabQuest Temperature Sensor",
      "labQuestLight": "LabQuest Light Sensor",
      "labQuestForce": "LabQuest Force Sensor",
      "labQuestPH": "LabQuest pH Sensor",
      "labQuestCO2": "LabQuest CO₂ sensor",
      "labQuestO2": "LabQuest O₂ sensor",
      "angularvelocity": "Angular Velocity",
      "wind_speed": "Wind Speed",
      "wind_direction": "Wind Direction",
      "wind_chill": "Wind Chill",
      "heat_index": "Heat Index",
      "dew_point": "Dew Point",
      "absolute_humidity": "Absolute Humidity",
      "station_pressure": "Station Pressure",
      "barometric_pressure": "Barometric Pressure"
    }
};

// TODO: remove when i18n module is integrated
export class i18n { // eslint-disable-line @typescript-eslint/naming-convention
    static t(id:string): string {
        var category = id.substring(id.indexOf(".")+1, id.lastIndexOf("."));
        var prop = id.substring(id.lastIndexOf(".")+1);
        return (SensorStrings[category] as IStringMap)[prop];
    }
}

export interface ISensorDefinitions {
  [key:string]: SensorDefinition;
}

export const SensorDefinitions:ISensorDefinitions = {
  "lux": {
    "sensorName": i18n.t("sensor.names.light"),
    "measurementName": i18n.t("sensor.measurements.light_level"),
    "measurementType": "light level",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 2000.0
  },
  "m": {
    "sensorName": i18n.t("sensor.names.motion"),
    "measurementName": i18n.t("sensor.measurements.position"),
    "measurementType": "position",
    "tareable": true,
    "minReading": -2.0,
    "maxReading": 2.0
  },
  "m/s²": {
    "sensorName": i18n.t("sensor.names.accelerometer"),
    "measurementName": i18n.t("sensor.measurements.acceleration"),
    "measurementType": "acceleration",
    "tareable": true,
    "minReading": -50.0,
    "maxReading": 50.0
  },
  "m/s^2": {
    "sensorName": i18n.t("sensor.names.accelerometer"),
    "measurementName": i18n.t("sensor.measurements.acceleration"),
    "measurementType": "acceleration",
    "tareable": true,
    "minReading": -50.0,
    "maxReading": 50.0
  },
  "g": {
    "sensorName": i18n.t("sensor.names.accelerometer"),
    "measurementName": i18n.t("sensor.measurements.acceleration"),
    "measurementType": "acceleration",
    "tareable": true,
    "minReading": -5.0,
    "maxReading": 5.0
  },
  "N/kg": {
    "sensorName": i18n.t("sensor.names.accelerometer"),
    "measurementName": i18n.t("sensor.measurements.acceleration"),
    "measurementType": "acceleration",
    "tareable": true,
    "minReading": -25.0,
    "maxReading": 25.0
  },
  "mg/L": {
    "sensorName": i18n.t("sensor.names.dissolved_oxygen"),
    "measurementName": i18n.t("sensor.measurements.dissolved_oxygen"),
    "measurementType": "do",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 12.0
  },
  "kPa": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 220.0
  },
  "N/m^2": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 220000.0
  },
  "mm Hg": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 2000.0
  },
  "in Hg": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 80.0
  },
  "mbar": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 2200.0
  },
  "psi": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 40.0
  },
  "atm": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 2.5
  },
  "torr": {
    "sensorName": i18n.t("sensor.names.pressure"),
    "measurementName": i18n.t("sensor.measurements.pressure"),
    "measurementType": "pressure",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 2000.0
  },
  "nC": {
    "sensorName": i18n.t("sensor.names.charge_sensor"),
    "measurementName": i18n.t("sensor.measurements.charge"),
    "measurementType": "charge",
    "tareable": false,
    "minReading": -20.0,
    "maxReading": 20.0
  },
  "V": {
    "sensorName": i18n.t("sensor.names.voltage"),
    "measurementName": i18n.t("sensor.measurements.potential"),
    "measurementType": "potential",
    "tareable": true,
    "minReading": -30.0,
    "maxReading": 30.0
  },
  "pH": {
    "sensorName": i18n.t("sensor.names.pH"),
    "measurementName": i18n.t("sensor.measurements.pH"),
    "measurementType": "ph",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 14.0
  },
  "ppm": {
    "sensorName": i18n.t("sensor.names.CO2_gas"),
    "measurementName": i18n.t("sensor.measurements.CO2"),
    "measurementType": "co2",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 5000.0
  },
  "ppt": {
    "sensorName": i18n.t("sensor.names.CO2_gas"),
    "measurementName": i18n.t("sensor.measurements.CO2"),
    "measurementType": "co2",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 5.0
  },
  "%": {
    "sensorName": i18n.t("sensor.names.CO2_gas"),
    "measurementName": i18n.t("sensor.measurements.CO2"),
    "measurementType": "co2",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 0.5
  },
  "%RH": {
    "sensorName": i18n.t("sensor.names.relative_humidity"),
    "measurementName": i18n.t("sensor.measurements.relative_humidity"),
    "measurementType": "relative humidity",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 100.0
  },
  "%T": {
    "sensorName": i18n.t("sensor.names.colorimeter"),
    "measurementName": i18n.t("sensor.measurements.transmittance"),
    "measurementType": "transmittance",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 100.0
  },
  "µS/cm": {
    "sensorName": i18n.t("sensor.names.conductivity"),
    "measurementName": i18n.t("sensor.measurements.conductivity"),
    "measurementType": "conductivity",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 2000.0
  },
  "dS/m": {
    "sensorName": i18n.t("sensor.names.conductivity"),
    "measurementName": i18n.t("sensor.measurements.conductivity"),
    "measurementType": "conductivity",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 2.0
  },
  "A": {
    "sensorName": i18n.t("sensor.names.current"),
    "measurementName": i18n.t("sensor.measurements.current"),
    "measurementType": "current",
    "tareable": true,
    "minReading": -1.2,
    "maxReading": 1.2
  },
  "mA": {
    "sensorName": i18n.t("sensor.names.current"),
    "measurementName": i18n.t("sensor.measurements.current"),
    "measurementType": "current",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 500.0
  },
  "°C": {
    "sensorName": i18n.t("sensor.names.temperature"),
    "measurementName": i18n.t("sensor.measurements.temperature"),
    "measurementType": "temperature",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 40.0
  },
  "degC": {
    "sensorName": i18n.t("sensor.names.temperature"),
    "measurementName": i18n.t("sensor.measurements.temperature"),
    "measurementType": "temperature",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 40.0
  },
  "°F": {
    "sensorName": i18n.t("sensor.names.temperature"),
    "measurementName": i18n.t("sensor.measurements.temperature"),
    "measurementType": "temperature",
    "tareable": false,
    "minReading": 30.0,
    "maxReading": 100.0
  },
  "degF": {
    "sensorName": i18n.t("sensor.names.temperature"),
    "measurementName": i18n.t("sensor.measurements.temperature"),
    "measurementType": "temperature",
    "tareable": false,
    "minReading": 30.0,
    "maxReading": 100.0
  },
  "K": {
    "sensorName": i18n.t("sensor.names.temperature"),
    "measurementName": i18n.t("sensor.measurements.temperature"),
    "measurementType": "temperature",
    "tareable": false,
    "minReading": 250.0,
    "maxReading": 400.0
  },
  "N": {
    "sensorName": i18n.t("sensor.names.force"),
    "measurementName": i18n.t("sensor.measurements.force"),
    "measurementType": "force",
    "tareable": true,
    "minReading": -50.0,
    "maxReading": 50.0
  },
  "lb": {
    "sensorName": i18n.t("sensor.names.force"),
    "measurementName": i18n.t("sensor.measurements.force"),
    "measurementType": "force",
    "tareable": true,
    "minReading": -12.5,
    "maxReading": 12.5
  },
  "mV": {
    "sensorName": null,
    "measurementName": i18n.t("sensor.measurements.potential"),
    "measurementType": "potential",
    "tareable": true,
    "minReading": -500.0,
    "maxReading": 1100.0
  },
  "m/s": {
    "sensorName": i18n.t("sensor.names.motion"),
    "measurementName": i18n.t("sensor.measurements.velocity"),
    "measurementType": "velocity",
    "tareable": true,
    "minReading": -5.0,
    "maxReading": 5.0
  },
  "ft/s": {
    "sensorName": i18n.t("sensor.names.anemometer"),
    "measurementName": i18n.t("sensor.measurements.speed"),
    "measurementType": "speed",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 100.0
  },
  "ft": {
    "sensorName": i18n.t("sensor.names.motion"),
    "measurementName": i18n.t("sensor.measurements.position"),
    "measurementType": "position",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 6.0
  },
  "kg": {
    "sensorName": i18n.t("sensor.names.hand_dynamometer"),
    "measurementName": i18n.t("sensor.measurements.force"),
    "measurementType": "force",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 50.0
  },
  "v": {
    "sensorName": i18n.t("sensor.names.heart_rate"),
    "measurementName": i18n.t("sensor.measurements.signal"),
    "measurementType": "signal",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 3.0
  },
  "mT": {
    "sensorName": i18n.t("sensor.names.magnetic_field"),
    "measurementName": i18n.t("sensor.measurements.magnetic_field"),
    "measurementType": "magnetic field",
    "tareable": true,
    "minReading": -8.0,
    "maxReading": 8.0
  },
  "G": {
    "sensorName": i18n.t("sensor.names.magnetic_field"),
    "measurementName": i18n.t("sensor.measurements.magnetic_field"),
    "measurementType": "magnetic field",
    "tareable": true,
    "minReading": -80.0,
    "maxReading": 80.0
  },
  "rad": {
    "sensorName": i18n.t("sensor.names.rotary_motion"),
    "measurementName": i18n.t("sensor.measurements.angle"),
    "measurementType": "angle",
    "tareable": true,
    "minReading": -15.0,
    "maxReading": 15.0
  },
  "°": {
    "sensorName": i18n.t("sensor.names.rotary_motion"),
    "measurementName": i18n.t("sensor.measurements.angle"),
    "measurementType": "angle",
    "tareable": true,
    "minReading": -1000.0,
    "maxReading": 1000.0
  },
  "cm": {
    "sensorName": i18n.t("sensor.names.linear_position_sensor"),
    "measurementName": i18n.t("sensor.measurements.position"),
    "measurementType": "position",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 15.0
  },
  "dB": {
    "sensorName": i18n.t("sensor.names.sound_level"),
    "measurementName": i18n.t("sensor.measurements.sound_level"),
    "measurementType": "sound level",
    "tareable": true,
    "minReading": 40.0,
    "maxReading": 110.0
  },
  "dbA": {
    "sensorName": i18n.t("sensor.names.sound_level"),
    "measurementName": i18n.t("sensor.measurements.sound_level"),
    "measurementType": "sound level",
    "tareable": true,
    "minReading": 40.0,
    "maxReading": 110.0
  },
  "rel": {
    "sensorName": i18n.t("sensor.names.spectrophotometer"),
    "measurementName": i18n.t("sensor.measurements.intensity"),
    "measurementType": "intensity",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 1.0
  },
  "Rel": {
    "sensorName": i18n.t("sensor.names.spectrophotometer"),
    "measurementName": i18n.t("sensor.measurements.fluorescence_405_nm"),
    "measurementType": "fluorescence 405 nm",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 1.0
  },
  "Rel.": {
    "sensorName": i18n.t("sensor.names.spectrophotometer"),
    "measurementName": i18n.t("sensor.measurements.fluorescence_500_nm"),
    "measurementType": "fluorescence 500 nm",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 1.0
  },
  "L/s": {
    "sensorName": i18n.t("sensor.names.spirometer"),
    "measurementName": i18n.t("sensor.measurements.flow_rate"),
    "measurementType": "flow rate",
    "tareable": true,
    "minReading": -4.0,
    "maxReading": 4.0
  },
  "mL/s": {
    "sensorName": i18n.t("sensor.names.spirometer"),
    "measurementName": i18n.t("sensor.measurements.flow_rate"),
    "measurementType": "flow rate",
    "tareable": true,
    "minReading": -4000.0,
    "maxReading": 4000.0
  },
  "NTU": {
    "sensorName": i18n.t("sensor.names.turbidity"),
    "measurementName": i18n.t("sensor.measurements.turbidity"),
    "measurementType": "turbidity",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 50.0
  },
  "mW/m²": {
    "sensorName": i18n.t("sensor.names.UV_sensor"),
    "measurementName": i18n.t("sensor.measurements.UV_intensity"),
    "measurementType": "uv intensity",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 20000.0
  },
  "mL": {
    "sensorName": i18n.t("sensor.names.drop_counter"),
    "measurementName": i18n.t("sensor.measurements.volume"),
    "measurementType": "volume",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 3.0
  },
  "f": {
    "sensorName": i18n.t("sensor.names.altitude"),
    "measurementName": i18n.t("sensor.measurements.altitude"),
    "measurementType": "altitude",
    "tareable": true,
    "minReading": -300.0,
    "maxReading": 300.0
  },
  "mph": {
    "sensorName": i18n.t("sensor.names.anemometer"),
    "measurementName": i18n.t("sensor.measurements.speed"),
    "measurementType": "speed",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 10.0
  },
  "km/h": {
    "sensorName": i18n.t("sensor.names.anemometer"),
    "measurementName": i18n.t("sensor.measurements.speed"),
    "measurementType": "speed",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 20.0
  },
  "knots": {
    "sensorName": i18n.t("sensor.names.anemometer"),
    "measurementName": i18n.t("sensor.measurements.speed"),
    "measurementType": "speed",
    "tareable": true,
    "minReading": 0.0,
    "maxReading": 50.0
  },
  "rad/s": {
    "sensorName": i18n.t("sensor.names.angularvelocity"),
    "measurementName": i18n.t("sensor.measurements.angular_velocity"),
    "measurementType": "angular velocity",
    "tareable": false,
    "minReading": -35.0,
    "maxReading": 35.0
  },
  "g/m³" : {
    "sensorName": i18n.t("sensor.names.absolute_humidity"),
    "measurementName": i18n.t("sensor.measurements.absolute_humidity"),
    "measurementType": "absolute humidity",
    "tareable": false,
    "minReading": 0,
    "maxReading": 100,
  },
  "m/s_WS" : {
    "sensorName": i18n.t("sensor.names.wind_speed"),
    "measurementName": i18n.t("sensor.measurements.wind_speed"),
    "measurementType": "wind speed",
    "tareable": false,
    "minReading": 0,
    "maxReading": 100,
    "displayUnits": "m/s"
  },
  "°_WD" : {
    "sensorName": i18n.t("sensor.names.wind_direction"),
    "measurementName": i18n.t("sensor.measurements.wind_direction"),
    "measurementType": "wind direction",
    "tareable": false,
    "minReading": 0,
    "maxReading": 360,
    "displayUnits": "°"
  },
  "°C_WC" : {
    "sensorName": i18n.t("sensor.names.wind_chilll"),
    "measurementName": i18n.t("sensor.measurements.wind_chilll"),
    "measurementType": "wind chill",
    "tareable": false,
    "minReading": -40,
    "maxReading":  125,
    "displayUnits": "°C"
  },
  "°C_HI" : {
    "sensorName": i18n.t("sensor.names.heat_index"),
    "measurementName": i18n.t("sensor.measurements.heat_index"),
    "measurementType": "heat index",
    "tareable": false,
    "minReading": -40,
    "maxReading":  125,
    "displayUnits": "°C"
  },
  "°C_DP" : {
    "sensorName": i18n.t("sensor.names.dew_point"),
    "measurementName": i18n.t("sensor.measurements.dew_point"),
    "measurementType": "dew_point",
    "tareable": false,
    "minReading": -40,
    "maxReading":  125,
    "displayUnits": "°C"
  },
  "mbar_SP": {
    "sensorName": i18n.t("sensor.names.station_pressure"),
    "measurementName": i18n.t("sensor.measurements.station_pressure"),
    "measurementType": "station pressure",
    "tareable": false,
    "minReading": 0,
    "maxReading":  1500,
    "displayUnits": "mbar"
  },
  "mbar_BP": {
    "sensorName": i18n.t("sensor.names.barometric_pressure"),
    "measurementName": i18n.t("sensor.measurements.barometric_pressure"),
    "measurementType": "barometric pressure",
    "tareable": false,
    "minReading": 0,
    "maxReading":  1500,
    "displayUnits": "mbar"
  },
  "m_AL": {
    "sensorName": i18n.t("sensor.names.altitude"),
    "measurementName": i18n.t("sensor.measurements.altitude"),
    "measurementType": "altitude",
    "tareable": false,
    "minReading": -300,
    "maxReading":  10000,
    "displayUnits": "m"
  },
  "%_RH": {
    "sensorName": i18n.t("sensor.names.relative_humidity"),
    "measurementName": i18n.t("sensor.measurements.relative_humidity"),
    "measurementType": "relative humidity",
    "tareable": false,
    "minReading": 0.0,
    "maxReading": 100.0,
    "displayUnits": "%"
  },
} as const;
