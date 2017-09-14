webpackJsonp([0],{

/***/ 109:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Format {
    static getPrecision(range) {
        var stepSize = range / 4000;
        var precision;
        var fixVal = 0;
        if (stepSize < 1) {
            fixVal = Math.round(-Math.log10(stepSize)) + 2;
        }
        precision = Math.log10(Math.round(stepSize)) + fixVal;
        precision = Math.max(1, Math.min(precision, 21));
        return precision;
    }
    static getFixValue(range) {
        var stepSize = range / 4000;
        var precision;
        if (stepSize < 1) {
            precision = Math.round(-Math.log10(stepSize));
        }
        else {
            precision = 0; //Math.round(Math.log10(Math.round(stepSize))) + 1;
        }
        precision = Math.max(0, Math.min(precision, 21));
        return precision;
    }
    static getAxisFix(range) {
        var stepSize = range / 10;
        var precision;
        if (stepSize < 1) {
            precision = Math.round(-Math.log10(stepSize) + 0.5);
        }
        else if (stepSize < 5) {
            precision = Math.round(-Math.log10(stepSize));
        }
        else {
            precision = 0;
        }
        precision = Math.max(0, Math.min(precision, 21));
        return precision;
    }
    static formatFixedValue(value, fix, unit = "", shorthand = false) {
        if ((value == null) || isNaN(value))
            return "";
        if (shorthand && value >= 10000) {
            return (Math.round(value) / 1000) + "k " + unit;
        }
        return value.toFixed(fix) + " " + unit;
    }
}
exports.Format = Format;


/***/ }),

/***/ 110:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// from concord-consortium/lab
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorStrings = {
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
        "no_sensors": "No sensors found.",
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
        "java_applet_error": "It appears that Java applets cannot run in your browser. If you are able to fix this, reload the page to use the sensor",
        "java_applet_not_loading": "The sensor applet appears not to be loading. If you are able to fix this, reload the page to use the sensor",
        "unexpected_error": "There was an unexpected error when connecting to the sensor.",
        "sensor_not_attached": "The sensor does not appear to be attached. Try re-attaching it, and then click \"Try Again\"",
        "sensor_or_device_unplugged": "The __sensor_or_device_name__ was unplugged. Try plugging it back in, and then click \"$t(sensor.messages.try_again)\".",
        "try_again": "Try Again",
        "cancel": "Cancel",
        "check_save": "Pressing New Run without pressing Save Data will discard the current data. Set up a new run without saving the data first?"
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
        "O2_concentration": "O₂ Concentration"
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
        "labQuestO2": "LabQuest O₂ sensor"
    }
};
// TODO: remove when i18n module is integrated
class i18n {
    static t(id) {
        var category = id.substring(id.indexOf(".") + 1, id.lastIndexOf("."));
        var prop = id.substring(id.lastIndexOf(".") + 1);
        return exports.SensorStrings[category][prop];
    }
}
exports.i18n = i18n;
exports.SensorDefinitions = {
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
    }
};


/***/ }),

/***/ 111:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * This component is a very thin wrapper around a standard <button> designed to prevent
 * extraneous focus highlighting added by browsers when clicking on a button while
 * maintaining keyboard accessibility. For details, see
 * https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
 */
const React = __webpack_require__(8);
const smart_focus_highlight_1 = __webpack_require__(62);
class SmartHighlightButton extends React.Component {
    constructor() {
        super(...arguments);
        // prevent extraneous focus highlight on click while maintaining keyboard accessibility
        // see https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
        this.suppressFocusHighlight = () => {
            smart_focus_highlight_1.default.suppressFocusHighlight(this.elementRef);
        };
    }
    render() {
        const _a = this.props, { className } = _a, others = __rest(_a, ["className"]), classes = (className ? className + ' ' : '') +
            smart_focus_highlight_1.default.kSmartFocusHighlightClass;
        return (React.createElement("button", Object.assign({ className: classes }, others, { ref: (elt) => this.elementRef = elt, onMouseEnter: this.suppressFocusHighlight, onMouseDown: this.suppressFocusHighlight }), this.props.children));
    }
}
exports.default = SmartHighlightButton;


/***/ }),

/***/ 112:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * This component is a very thin wrapper around a standard <select> designed to prevent
 * extraneous focus highlighting added by browsers when clicking on a button while
 * maintaining keyboard accessibility. For details, see
 * https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
 */
const React = __webpack_require__(8);
const smart_focus_highlight_1 = __webpack_require__(62);
class SmartHighlightSelect extends React.Component {
    constructor() {
        super(...arguments);
        // prevent extraneous focus highlight on click while maintaining keyboard accessibility
        // see https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
        this.suppressFocusHighlight = () => {
            smart_focus_highlight_1.default.suppressFocusHighlight(this.elementRef);
        };
    }
    render() {
        const _a = this.props, { className } = _a, others = __rest(_a, ["className"]), classes = (className ? className + ' ' : '') +
            smart_focus_highlight_1.default.kSmartFocusHighlightClass;
        return (React.createElement("select", Object.assign({ className: classes }, others, { ref: (elt) => this.elementRef = elt, onMouseEnter: this.suppressFocusHighlight, onMouseDown: this.suppressFocusHighlight }), this.props.children));
    }
}
exports.default = SmartHighlightSelect;


/***/ }),

/***/ 123:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(8);
const ReactDOM = __webpack_require__(29);
const app_1 = __webpack_require__(223);
ReactDOM.render(React.createElement(app_1.App, null), document.getElementById("app"));


/***/ }),

/***/ 223:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(8);
const react_modal_1 = __webpack_require__(97);
const sensor_1 = __webpack_require__(231);
const sensor_configuration_1 = __webpack_require__(232);
const sensor_graph_1 = __webpack_require__(233);
const control_panel_1 = __webpack_require__(271);
const codap_1 = __webpack_require__(272);
const sensor_definitions_1 = __webpack_require__(110);
const sensor_connector_interface_1 = __webpack_require__(122);
const smart_focus_highlight_1 = __webpack_require__(62);
const lodash_1 = __webpack_require__(56);
const SENSOR_IP = "http://127.0.0.1:11180";
function newSensorFromDataColumn(sensorIndex, dataColumn) {
    let newSensor = new sensor_1.Sensor();
    newSensor.index = sensorIndex;
    newSensor.columnID = dataColumn.id;
    newSensor.sensorPosition = dataColumn.position;
    newSensor.valueUnit = dataColumn.units;
    newSensor.definition = sensor_definitions_1.SensorDefinitions[dataColumn.units];
    return newSensor;
}
function matchSensorsToDataColumns(sensors, dataColumns) {
    let matched = [null, null], columns = dataColumns.slice();
    function matchSensors(test) {
        matched.forEach((sensor, index) => {
            let found;
            if (!matched[index]) {
                found = lodash_1.find(columns, (c) => test(c, sensors[index]));
                if (found) {
                    matched[index] = newSensorFromDataColumn(index, found);
                    // remove matched column so it can't be matched again
                    lodash_1.pull(columns, found);
                }
            }
        });
        return matched[0] && matched[1];
    }
    // match by column ID
    if (matchSensors((c, s) => c.id === s.columnID))
        return matched;
    // match by sensor position (as long as units are compatible)
    if (matchSensors((c, s) => (c.position === s.sensorPosition) && (c.units === s.valueUnit)))
        return matched;
    // match by units (independent of position)
    if (matchSensors((c, s) => c.units === s.valueUnit))
        return matched;
    // match by position (independent of units)
    if (matchSensors((c, s) => c.position === s.sensorPosition))
        return matched;
    // last resort - match whatever's available
    if (matchSensors((c, s) => true))
        return matched;
    // clear unmatched sensors
    matched.forEach((s, i) => { if (!s)
        matched[i] = new sensor_1.Sensor(); });
    return matched;
}
class App extends React.Component {
    constructor(props) {
        super(props);
        this.selectionRange = { start: 0, end: undefined };
        this.disableWarning = false;
        this.handleSensorSelect = (sensorIndex, columnID) => {
            let { sensors } = this.state;
            // if same sensor selected, there's nothing to do
            if (sensors[sensorIndex].columnID === columnID)
                return;
            // if the other graphed sensor is selected, just switch them
            const otherIndex = 1 - sensorIndex;
            if (sensors[otherIndex].columnID === columnID) {
                sensors.reverse();
            }
            else {
                const sensorConfig = this.state.sensorConfig, dataColumn = sensorConfig && sensorConfig.getColumnByID(columnID), newSensor = dataColumn
                    ? newSensorFromDataColumn(sensorIndex, dataColumn)
                    : new sensor_1.Sensor();
                sensors[sensorIndex] = newSensor;
            }
            this.setState({ sensors });
        };
        this.state = {
            sensorConfig: null,
            sensors: [new sensor_1.Sensor(), new sensor_1.Sensor()],
            hasData: false,
            dataChanged: false,
            dataReset: false,
            collecting: false,
            runLength: 10,
            xStart: 0,
            xEnd: 10.01,
            timeUnit: "",
            warnNewModal: false,
            reconnectModal: false,
            statusMessage: undefined,
            secondGraph: false
        };
        this.messages = sensor_definitions_1.SensorStrings.messages;
        this.connectCodap = this.connectCodap.bind(this);
        this.onSensorConnect = this.onSensorConnect.bind(this);
        this.onSensorData = this.onSensorData.bind(this);
        this.onSensorCollectionStopped = this.onSensorCollectionStopped.bind(this);
        this.onSensorDisconnect = this.onSensorDisconnect.bind(this);
        setTimeout(this.connectCodap, 1000);
        this.sensorConnector = new sensor_connector_interface_1.default();
        this.sensorConnector.on("datasetAdded", this.onSensorConnect);
        this.sensorConnector.on("interfaceConnected", this.onSensorConnect);
        this.sensorConnector.on("columnAdded", this.onSensorConnect);
        this.sensorConnector.on("columnMoved", this.onSensorConnect);
        this.sensorConnector.on("columnRemoved", this.onSensorConnect);
        this.sensorConnector.startPolling(SENSOR_IP);
        this.onTimeSelect = this.onTimeSelect.bind(this);
        this.onGraphZoom = this.onGraphZoom.bind(this);
        this.startSensor = this.startSensor.bind(this);
        this.stopSensor = this.stopSensor.bind(this);
        this.sendData = this.sendData.bind(this);
        this.checkNewData = this.checkNewData.bind(this);
        this.closeWarnNewModal = this.closeWarnNewModal.bind(this);
        this.tryReconnectModal = this.tryReconnectModal.bind(this);
        this.discardData = this.discardData.bind(this);
        this.toggleWarning = this.toggleWarning.bind(this);
        this.toggleGraph = this.toggleGraph.bind(this);
        this.reload = this.reload.bind(this);
    }
    componentDidMount() {
        smart_focus_highlight_1.default.enableFocusHighlightOnKeyDown();
    }
    connectCodap() {
        this.codap = new codap_1.Codap();
    }
    onSensorConnect() {
        const config = this.sensorConnector.stateMachine.currentActionArgs[1], sensorConfig = new sensor_configuration_1.SensorConfiguration(config), interfaceType = sensorConfig.interface;
        if (!sensorConfig.hasInterface) {
            this.setState({
                sensorConfig: null,
                statusMessage: this.messages["no_sensors"]
            });
        }
        else {
            this.sensorConnector.off("*", this.onSensorConnect);
            console.log("interface connected: " + interfaceType);
            this.setState({
                statusMessage: ""
            });
            const timeUnit = sensorConfig.timeUnit || "", dataColumns = sensorConfig.dataColumns, sensors = matchSensorsToDataColumns(this.state.sensors, dataColumns);
            this.setState({ sensorConfig, sensors, timeUnit });
            this.sensorConnector.on("data", this.onSensorData);
            this.sensorConnector.on("interfaceRemoved", this.onSensorDisconnect);
            this.sensorConnector.on("columnAdded", this.onSensorConnect);
            this.sensorConnector.on("columnMoved", this.onSensorConnect);
            this.sensorConnector.on("columnRemoved", this.onSensorConnect);
        }
    }
    sensorHasData() {
        return (this.sensorConnector &&
            this.sensorConnector.datasets[0] &&
            this.sensorConnector.datasets[0].columns[1]);
    }
    startSensor() {
        this.sensorConnector.requestStart();
        this.setState({
            statusMessage: this.messages["starting_data_collection"]
        });
    }
    stopSensor() {
        this.sensorConnector.requestStop();
        this.lastTime = 0;
    }
    onSensorCollectionStopped() {
        this.setState({
            collecting: false,
            statusMessage: this.messages["data_collection_stopped"]
        });
        this.sensorConnector.off("collectionStopped", this.onSensorCollectionStopped);
    }
    onSensorData(setId) {
        if (!this.state.collecting) {
            this.setState({
                hasData: true,
                dataChanged: true,
                collecting: true,
                statusMessage: this.messages["collecting_data"]
            });
            this.sensorConnector.on("collectionStopped", this.onSensorCollectionStopped);
        }
        var sensorInfo = this.sensorConnector.stateMachine.currentActionArgs;
        var setID = sensorInfo[1];
        // set IDs ending in 0 contain time data
        if (setID.slice(setID.length - 1) === 0) {
            var timeData = sensorInfo[2];
            // make sure the sensor graph has received the update for the final value
            if (this.lastTime && this.lastTime > this.state.runLength) {
                this.stopSensor();
            }
            else {
                this.lastTime = timeData[timeData.length - 1];
            }
        }
    }
    onSensorDisconnect() {
        this.setState({
            reconnectModal: true,
            sensorConfig: null
        });
    }
    sendData() {
        const { sensors, secondGraph } = this.state, data = sensors.map((sensor) => sensor.sensorData.slice(this.selectionRange.start, this.selectionRange.end));
        let names = sensors.map((sensor) => sensor.definition.measurementName);
        if (!secondGraph) {
            this.codap.sendData(data[0], names[0]);
        }
        else {
            names = names.map((name, index) => `${name}_${index + 1}`);
            this.codap.sendDualData(data[0], names[0], data[1], names[1]);
        }
        this.setState({
            dataChanged: false
        });
    }
    checkNewData() {
        if (this.state.dataChanged && !this.disableWarning) {
            this.setState({
                warnNewModal: true
            });
        }
        else {
            this.newData();
        }
    }
    newData() {
        this.setState({
            hasData: false,
            dataReset: true,
            dataChanged: false
        });
        this.lastDataIndex = 0;
    }
    onTimeSelect(newTime) {
        this.setState({
            runLength: newTime,
            xStart: 0,
            // without the .01, last tick number sometimes fails to display
            xEnd: newTime + 0.01
        });
    }
    onGraphZoom(xStart, xEnd) {
        const sensor1Data = this.state.sensors[0].sensorData;
        // convert from time value to index
        var i, entry, nextEntry;
        for (i = 0; i < sensor1Data.length - 1; i++) {
            entry = sensor1Data[i];
            nextEntry = sensor1Data[i + 1];
            if (entry[0] === xStart) {
                this.selectionRange.start = i;
                break;
            }
            else if (entry[0] < xStart && nextEntry[0] >= xStart) {
                this.selectionRange.start = i + 1;
                break;
            }
        }
        for (i; i < sensor1Data.length - 1; i++) {
            entry = sensor1Data[i];
            nextEntry = sensor1Data[i + 1];
            if (entry[0] === xEnd) {
                this.selectionRange.end = i;
                break;
            }
            else if (entry[0] < xEnd && nextEntry[0] >= xEnd) {
                this.selectionRange.end = i + 1;
                break;
            }
        }
        this.setState({
            xStart: xStart,
            xEnd: xEnd,
            dataChanged: true
        });
    }
    closeWarnNewModal() {
        this.setState({
            warnNewModal: false
        });
    }
    discardData() {
        this.closeWarnNewModal();
        this.newData();
    }
    tryReconnectModal() {
        this.setState({
            reconnectModal: false
        });
        this.onSensorConnect();
    }
    toggleWarning() {
        this.disableWarning = true;
    }
    toggleGraph() {
        this.setState({
            secondGraph: !this.state.secondGraph
        });
    }
    reload() {
        location.reload();
    }
    componentDidUpdate(prevProps, prevState) {
        if (!prevState.dataReset && this.state.dataReset) {
            this.setState({
                dataReset: false
            });
        }
    }
    renderGraph(sensor, title, isSingletonGraph, isLastGraph = isSingletonGraph) {
        const sensorColumns = this.state.sensorConfig && this.state.sensorConfig.dataColumns;
        return React.createElement(sensor_graph_1.SensorGraph, { sensor: sensor, title: title, sensorConnector: this.sensorConnector, onGraphZoom: this.onGraphZoom, onSensorSelect: this.handleSensorSelect, runLength: this.state.runLength, xStart: this.state.xStart, xEnd: this.state.xEnd, isSingletonGraph: isSingletonGraph, isLastGraph: isLastGraph, sensorColumns: sensorColumns, collecting: this.state.collecting, dataReset: this.state.dataReset });
    }
    render() {
        var { sensorConfig, sensors, secondGraph } = this.state, codapURL = window.self === window.top
            ? "http://codap.concord.org/releases/latest?di=" + window.location.href
            : "", interfaceType = (sensorConfig && sensorConfig.interface) || "";
        return (React.createElement("div", null,
            React.createElement(react_modal_1.default, { contentLabel: "Discard data?", isOpen: this.state.warnNewModal, style: {
                    content: {
                        bottom: "auto"
                    }
                } },
                React.createElement("p", null, this.messages["check_save"]),
                React.createElement("input", { type: "checkbox", onChange: this.toggleWarning }),
                React.createElement("label", null, "Don't show this message again"),
                React.createElement("hr", null),
                React.createElement("button", { onClick: this.closeWarnNewModal }, "Go back"),
                React.createElement("button", { onClick: this.discardData }, "Discard the data")),
            React.createElement(react_modal_1.default, { contentLabel: "Sensor not attached", isOpen: this.state.reconnectModal, style: {
                    content: {
                        bottom: "auto"
                    }
                } },
                React.createElement("p", null, this.messages["sensor_not_attached"]),
                React.createElement("hr", null),
                React.createElement("button", { onClick: this.tryReconnectModal }, "Try again")),
            React.createElement("div", { className: "app-top-bar" },
                React.createElement("label", { className: "two-sensors-checkbox" },
                    React.createElement("input", { type: "checkbox", id: "toggleGraphBtn", onClick: this.toggleGraph }),
                    "Two sensors"),
                React.createElement("div", null, this.state.statusMessage || "\xA0")),
            this.renderGraph(sensors[0], "graph1", !secondGraph),
            secondGraph
                ? this.renderGraph(sensors[1], "graph2", false, true)
                : null,
            React.createElement(control_panel_1.ControlPanel, { interfaceType: interfaceType, collecting: this.state.collecting, hasData: this.state.hasData, dataChanged: this.state.dataChanged, duration: 10, durationUnit: "s", durationOptions: [1, 5, 10, 15, 20, 30, 45, 60], embedInCodapUrl: codapURL, onDurationChange: this.onTimeSelect, onStartCollecting: this.startSensor, onStopCollecting: this.stopSensor, onNewRun: this.checkNewData, onSaveData: this.sendData, onReloadPage: this.reload })));
    }
}
exports.App = App;


/***/ }),

/***/ 231:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Sensor {
    constructor() {
        this.sensorData = [];
        this.definition = {
            sensorName: "",
            measurementName: "",
            measurementType: "",
            minReading: 0,
            maxReading: 10,
            tareable: false
        };
    }
}
exports.Sensor = Sensor;


/***/ }),

/***/ 232:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __webpack_require__(56);
class SensorConfiguration {
    constructor(config) {
        this.config = config;
    }
    get interface() {
        return this.config.currentInterface;
    }
    get hasInterface() {
        return this.interface && (this.interface !== "None Found");
    }
    get setID() {
        // current setID is the largest numeric setID
        const keys = Object.keys(this.config.sets), numKeys = keys.map((id) => Number(id));
        return Math.max.apply(Math, numKeys);
    }
    get columns() {
        const setID = this.setID, colIDs = this.config.sets[setID].colIDs;
        // setID -> set -> colIDs -> columns
        return colIDs.map((colID) => this.config.columns[colID]);
    }
    getColumnByID(columnID) {
        return columnID != null ? this.config.columns[columnID] : null;
    }
    get timeColumn() {
        return lodash_1.find(this.columns, (col) => col.name === "Time");
    }
    get dataColumns() {
        return this.columns.filter((col) => col.name !== "Time");
    }
    get timeUnit() {
        const timeColumn = this.timeColumn;
        return timeColumn && timeColumn.units;
    }
}
exports.SensorConfiguration = SensorConfiguration;


/***/ }),

/***/ 233:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(8);
const graph_1 = __webpack_require__(234);
const graph_side_panel_1 = __webpack_require__(247);
const react_sizeme_1 = __webpack_require__(113);
const kSidePanelWidth = 160, kPairedGraphHeight = 190, kGraphLabelHeight = 18, kGraphWithLabelHeight = kPairedGraphHeight + kGraphLabelHeight, kBetweenGraphMargin = 10, kSingletonGraphHeight = kGraphWithLabelHeight + kBetweenGraphMargin + kPairedGraphHeight;
class SensorGraphImp extends React.Component {
    constructor(props) {
        super(props);
        this.lastDataIndex = 0;
        this.zeroSensor = () => {
            this.setState({
                tareValue: this.state.sensorValue || 0
            });
        };
        this.onSensorStatus = () => {
            // find the value for the currently selected sensor/unit type
            var sensorColumnID = this.props.sensor.columnID, dataColumn = sensorColumnID && this.getDataColumn(sensorColumnID), liveValue = dataColumn ? Number(dataColumn.liveValue) : undefined;
            if (liveValue != null) {
                this.props.sensor.sensorValue = liveValue;
                this.setState({ sensorValue: liveValue });
            }
            else {
                this.setState({ sensorActive: false, sensorValue: undefined, dataChanged: true });
            }
        };
        this.onSensorData = (setId) => {
            if (!this.props.collecting) {
                return;
            }
            var dataset = null;
            for (var i = 0; i < this.props.sensorConnector.datasets.length; i++) {
                if (this.props.sensorConnector.datasets[i].id === setId) {
                    dataset = this.props.sensorConnector.datasets[i];
                    break;
                }
            }
            if (dataset == null) {
                return;
            }
            const timeData = dataset.columns[0].data || [], timeDataLength = timeData.length, dataColumn = this.getDataColumn(this.props.sensor.columnID, dataset), sensorData = (dataColumn && dataColumn.data) || [], sensorDataLength = sensorData.length;
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
                for (var i = 0; i < newTimeData.length; i++) {
                    var time = Number(newTimeData[i].toFixed(2));
                    var value = newValueData[i] - this.state.tareValue;
                    if (time <= this.props.runLength) {
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
        };
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
    getDataColumn(columnID, dataset) {
        if (dataset == null) {
            dataset = this.props.sensorConnector.stateMachine.datasets[0];
        }
        var dataColumns = (dataset && dataset.columns) || [];
        for (var i = 0; i < dataColumns.length; i++) {
            var dataColumn = dataColumns[i];
            if ((columnID != null) && (dataColumn.id === columnID)) {
                return dataColumn;
            }
        }
        console.log("data column not found (" + columnID + ")");
        return null;
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.dataReset && nextProps.dataReset) {
            this.lastDataIndex = 0;
            this.setState({
                sensorData: []
            });
        }
    }
    renderGraph(graphWidth) {
        const height = this.props.isSingletonGraph
            ? kSingletonGraphHeight
            : (this.props.isLastGraph ? kGraphWithLabelHeight : kPairedGraphHeight), sensorDefinition = this.props.sensor && this.props.sensor.definition, minReading = sensorDefinition && sensorDefinition.minReading, maxReading = sensorDefinition && sensorDefinition.maxReading, measurementName = (sensorDefinition && sensorDefinition.measurementName) || "", valueUnit = this.props.sensor.valueUnit || "", xLabel = this.props.isLastGraph ? `Time (${this.state.timeUnit})` : "", yLabel = measurementName
            ? `${measurementName} (${valueUnit})`
            : "Sensor Reading (-)";
        return (React.createElement("div", { className: "sensor-graph" },
            React.createElement(graph_1.Graph, { title: this.props.title, width: graphWidth, height: height, data: this.state.sensorData, onZoom: this.props.onGraphZoom, xMin: this.props.xStart, xMax: this.props.xEnd, yMin: minReading != null ? minReading : 0, yMax: maxReading != null ? maxReading : 10, xLabel: xLabel, yLabel: yLabel })));
    }
    renderSidePanel() {
        return (React.createElement(graph_side_panel_1.GraphSidePanel, { width: kSidePanelWidth, sensor: this.props.sensor, sensorColumns: this.props.sensorColumns, onZeroSensor: this.zeroSensor, onSensorSelect: this.props.onSensorSelect }));
    }
    render() {
        const { width } = this.props.size, graphWidth = width != null ? width - kSidePanelWidth : undefined;
        return (React.createElement("div", { className: "sensor-graph-panel" },
            this.renderGraph(graphWidth),
            this.renderSidePanel()));
    }
}
exports.SensorGraphImp = SensorGraphImp;
const sizeMeConfig = {
    monitorWidth: true,
    noPlaceholder: true
};
exports.SensorGraph = react_sizeme_1.default(sizeMeConfig)(SensorGraphImp);


/***/ }),

/***/ 234:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(8);
const dygraphs_1 = __webpack_require__(102);
const format_1 = __webpack_require__(109);
class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: this.props.width,
            height: this.props.height,
            data: this.props.data,
            xMin: this.props.xMin,
            xMax: this.props.xMax,
            yMin: this.props.yMin,
            yMax: this.props.yMax,
            xLabel: this.props.xLabel,
            yLabel: this.props.yLabel,
            xFix: format_1.Format.getFixValue(this.props.xMax - this.props.xMin),
            yFix: format_1.Format.getFixValue(this.props.yMax - this.props.yMin),
            xAxisFix: format_1.Format.getAxisFix(this.props.xMax - this.props.xMin),
            yAxisFix: format_1.Format.getAxisFix(this.props.yMax - this.props.yMin),
        };
        this.dyUpdateProps = ["width", "height", "xMin", "xMax", "yMin", "yMax", "xLabel", "yLabel"];
        this.autoScale = this.autoScale.bind(this);
        this.onZoom = this.onZoom.bind(this);
    }
    // TODO: remove redundant calls
    checkData(data) {
        if (!data.length) {
            data = [[0, 0]];
        }
        return data;
    }
    update() {
        if (!this.dygraph) {
            return;
        }
        var data = this.checkData(this.state.data);
        this.dygraph.updateOptions({
            file: data,
            dateWindow: [0, this.state.xMax],
            valueRange: [this.state.yMin, this.state.yMax],
            xlabel: this.state.xLabel,
            ylabel: this.state.yLabel
        });
        this.dygraph.resize();
    }
    autoScale() {
        if (this.state.data && (this.state.data.length > 1))
            this.dygraph.resetZoom();
    }
    onZoom(xStart, xEnd) {
        var yRange = this.dygraph.yAxisRange();
        var xRange = this.dygraph.xAxisRange();
        this.setState({
            xFix: format_1.Format.getFixValue(xRange[1] - xRange[0]),
            yFix: format_1.Format.getFixValue(yRange[1] - yRange[0]),
            xAxisFix: format_1.Format.getAxisFix(xRange[1] - xRange[0]),
            yAxisFix: format_1.Format.getAxisFix(yRange[1] - yRange[0])
        });
        this.props.onZoom(xStart, xEnd);
    }
    componentDidMount() {
        var data = this.checkData(this.state.data);
        this.dygraph = new dygraphs_1.default("sensor-graph-" + this.props.title, data, {
            dateWindow: [0, this.state.xMax],
            zoomCallback: this.onZoom,
            axes: {
                x: {
                    valueFormatter: (val) => {
                        return format_1.Format.formatFixedValue(val, 2);
                    },
                    axisLabelFormatter: (val) => {
                        return format_1.Format.formatFixedValue(val, this.state.xAxisFix);
                    }
                },
                y: {
                    valueFormatter: (val) => {
                        return format_1.Format.formatFixedValue(val, this.state.yFix);
                    },
                    axisLabelFormatter: (val) => {
                        return format_1.Format.formatFixedValue(val, this.state.yAxisFix, "", true);
                    }
                }
            },
            xlabel: this.state.xLabel,
            ylabel: this.state.yLabel,
            legend: "follow",
            underlayCallback: function (canvas, area, g) {
                canvas.fillStyle = "rgba(255, 255, 255, 1.0)";
                canvas.fillRect(area.x, area.y, area.w, area.h);
            }
        });
    }
    componentWillReceiveProps(nextProps) {
        var data = this.checkData(nextProps.data);
        var newState = {};
        this.dyUpdateProps.forEach((prop) => {
            if (nextProps[prop] !== this.props[prop]) {
                newState[prop] = nextProps[prop];
            }
        });
        if (data.length !== this.state.data.length) {
            newState.data = data;
        }
        if (newState.yMax) {
            newState.yFix = format_1.Format.getFixValue(newState.yMax);
            newState.yAxisFix = format_1.Format.getAxisFix(newState.yMax);
        }
        if (newState.xMax) {
            newState.xFix = format_1.Format.getFixValue(newState.xMax);
            newState.xAxisFix = format_1.Format.getAxisFix(newState.xMax);
        }
        this.setState(newState);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (nextState.data.length !== this.state.data.length) ||
            this.dyUpdateProps.some((prop) => nextState[prop] !== this.state[prop]);
    }
    componentDidUpdate(prevProps, prevState) {
        this.update();
    }
    render() {
        let graphStyle = {};
        if (this.props.width && isFinite(this.props.width))
            graphStyle.width = this.props.width;
        if (this.props.height && isFinite(this.props.height))
            graphStyle.height = this.props.height;
        // don't show the rescale button if there's no data to scale
        let buttonStyle = {}, hasData = this.state.data && (this.state.data.length > 1);
        if (!hasData)
            buttonStyle.display = "none";
        return (React.createElement("div", { style: { position: "relative" } },
            React.createElement("div", { id: "sensor-graph-" + this.props.title, className: "graph-box", style: graphStyle }),
            React.createElement("a", { onClick: this.autoScale, className: "graph-rescale-button", style: buttonStyle, title: "Show all data (autoscale)" },
                React.createElement("i", { className: "fa fa-arrows fa-lg" }))));
    }
}
exports.Graph = Graph;


/***/ }),

/***/ 247:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(8);
const format_1 = __webpack_require__(109);
const sensor_definitions_1 = __webpack_require__(110);
const smart_highlight_button_1 = __webpack_require__(111);
const smart_highlight_select_1 = __webpack_require__(112);
exports.GraphSidePanel = (props) => {
    const { sensor, onZeroSensor, onSensorSelect } = props, tareValue = sensor.tareValue || 0, sensorUnitStr = sensor.valueUnit || "";
    const handleZeroSensor = () => {
        if (onZeroSensor)
            onZeroSensor();
    };
    const handleSensorSelect = (evt) => {
        if (onSensorSelect && (props.sensor.index != null)) {
            const selectedColID = evt.currentTarget.value;
            onSensorSelect(props.sensor.index, selectedColID);
        }
    };
    const sensorReading = () => {
        const { sensor } = props, sensorDefinition = sensor && sensor.definition, sensorValue = sensor && sensor.sensorValue;
        if (!sensorDefinition || (sensorValue == null) || isNaN(sensorValue))
            return "";
        const sensorRange = sensorDefinition.maxReading - sensorDefinition.minReading, sensorPrecision = format_1.Format.getFixValue(sensorRange), reading = format_1.Format.formatFixedValue(sensorValue - tareValue, sensorPrecision);
        return (sensorUnitStr) ? `${reading} ${sensorUnitStr}` : reading;
    };
    const sensorSelectOptions = (sensorColumns) => {
        if (sensor.index == null)
            return null;
        return (sensorColumns || []).map((column, index) => {
            const units = column && column.units, columnID = column && column.id, sensorDef = units && sensor_definitions_1.SensorDefinitions[units], measurementName = sensorDef && sensorDef.measurementName;
            if (!measurementName)
                return null;
            const measurementNameWithUnits = units
                ? `${measurementName} (${units}) [${index + 1}]`
                : measurementName;
            return (React.createElement("option", { key: units + String(index), value: columnID }, measurementNameWithUnits));
        });
    };
    const width = props.width && isFinite(props.width) ? props.width : null, style = width ? { flex: `0 0 ${width}px` } : {}, sensorOptions = sensorSelectOptions(props.sensorColumns), enableSensorSelect = sensorOptions && (sensorOptions.length > 1), sensorDefinition = props.sensor && props.sensor.definition, disableZeroSensor = !sensorDefinition || !sensorDefinition.tareable;
    return (React.createElement("div", { className: "graph-side-panel", style: style },
        React.createElement("label", { className: "reading-label side-panel-item" }, "Reading:"),
        React.createElement("label", { className: "sensor-reading side-panel-item" }, sensorReading()),
        React.createElement("label", { className: "sensor-label side-panel-item" }, "Sensor:"),
        React.createElement(smart_highlight_select_1.default, { className: "sensor-select side-panel-item", value: sensor.columnID, disabled: !enableSensorSelect, onChange: handleSensorSelect }, sensorOptions),
        React.createElement(smart_highlight_button_1.default, { className: "zero-button side-panel-item", onClick: handleZeroSensor, disabled: disableZeroSensor }, "Zero Sensor")));
};


/***/ }),

/***/ 271:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(8);
const smart_highlight_button_1 = __webpack_require__(111);
const smart_highlight_select_1 = __webpack_require__(112);
exports.ControlPanel = (props) => {
    const disableStartCollecting = !props.interfaceType || props.collecting || props.hasData, disableStopCollecting = !props.collecting, disableSendData = !(props.hasData && props.dataChanged) || props.collecting, disableNewData = !props.hasData || props.collecting, durationOptions = (props.durationOptions || []).map((d) => {
        const dStr = String(d), dFormatted = d.toFixed(1) + props.durationUnit;
        return React.createElement("option", { key: dStr, value: dStr }, dFormatted);
    });
    function handleDurationChange(evt) {
        if (props.onDurationChange)
            props.onDurationChange(Number(evt.currentTarget.value));
    }
    function renderEmbedInCodapUrl(url) {
        if (!url)
            return null;
        return (React.createElement("a", { className: "embed-codap-link", href: url }, "Embed in CODAP"));
    }
    return (React.createElement("div", { className: "control-panel" },
        React.createElement("div", { className: "cc-logo" }),
        React.createElement("span", { className: "duration-label" }, "Duration:"),
        React.createElement(smart_highlight_select_1.default, { className: "duration-select control-panel-select", onChange: handleDurationChange, defaultValue: String(props.duration) }, [durationOptions]),
        React.createElement(smart_highlight_button_1.default, { className: "startSensor control-panel-button", onClick: props.onStartCollecting, disabled: disableStartCollecting }, "Start"),
        React.createElement(smart_highlight_button_1.default, { className: "stopSensor control-panel-button", onClick: props.onStopCollecting, disabled: disableStopCollecting }, "Stop"),
        React.createElement(smart_highlight_button_1.default, { className: "sendData control-panel-button", onClick: props.onSaveData, disabled: disableSendData }, "Save Data"),
        React.createElement(smart_highlight_button_1.default, { className: "newData control-panel-button", onClick: props.onNewRun, disabled: disableNewData }, "New Run"),
        React.createElement("div", { className: "right-controls" },
            React.createElement("div", null,
                React.createElement("a", { onClick: props.onReloadPage, className: "reload-page-button", title: "Reload page" },
                    React.createElement("i", { className: "fa fa-repeat fa-2x" }))),
            renderEmbedInCodapUrl(props.embedInCodapUrl))));
};


/***/ }),

/***/ 272:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const CodapInterface = __webpack_require__(273);
class Codap {
    constructor() {
        this.state = {};
        this.dataSetName = "sensor_interactive";
        this.dataSetTitle = "Sensor Interactive";
        this.dataSetAttrs = [{ name: "Time", type: 'numeric', precision: 3 }];
        this.dataSetTemplate = {
            name: "{name}",
            collections: [
                {
                    name: 'runs',
                    attrs: [{ name: "Run", type: 'categorical' }],
                },
                {
                    name: 'measurements',
                    parent: 'runs',
                    labels: {
                        pluralCase: "measurements",
                        setOfCasesWithArticle: "a sample"
                    },
                    attrs: this.dataSetAttrs
                }
            ]
        };
        CodapInterface.init({
            name: this.dataSetName,
            title: this.dataSetTitle,
            dimensions: { width: 460, height: 500 },
            version: '0.1'
        }, this.responseCallback).then((iResult) => {
            // get interactive state so we can save the data set index.
            this.state = CodapInterface.getInteractiveState();
        });
    }
    responseCallback(response) {
        if (response) {
            //console.log("codap response: success=" + response.success);
        }
    }
    requestDataContext() {
        return CodapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + this.dataSetName + ']'
        }, this.responseCallback);
    }
    updateDataContext(attrs) {
        console.log("updateDataContext");
        attrs.forEach((attr) => {
            var exists = false;
            this.dataSetAttrs.forEach((dataSetAttr) => {
                if (dataSetAttr.name === attr) {
                    exists = true;
                }
            });
            if (!exists) {
                this.dataSetAttrs.push({ name: attr, type: 'numeric', precision: 4 });
            }
        });
        return CodapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext[' + this.dataSetName + '].collection[measurements].attribute',
            values: this.dataSetAttrs
        }, this.responseCallback);
    }
    requestCreateDataSet() {
        var dataSetDef = Object.assign({}, this.dataSetTemplate);
        dataSetDef.name = this.dataSetName;
        return CodapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: dataSetDef
        }, this.responseCallback);
    }
    guaranteeCaseTable() {
        return new Promise((resolve, reject) => {
            CodapInterface.sendRequest({
                action: 'get',
                resource: 'componentList'
            }, this.responseCallback)
                .then((iResult) => {
                if (iResult.success) {
                    // look for a case table in the list of components.
                    if (iResult.values && iResult.values.some(function (component) {
                        return component.type === 'caseTable';
                    })) {
                        resolve(iResult);
                    }
                    else {
                        CodapInterface.sendRequest({
                            action: 'create',
                            resource: 'component',
                            values: {
                                type: 'caseTable',
                                dataContext: this.dataSetName
                            }
                        }, this.responseCallback).then((result) => {
                            resolve(result);
                        });
                    }
                }
                else {
                    reject('api error');
                }
            });
        });
    }
    sendData(data, dataType) {
        // if a run number has not yet been initialized, do so now.
        if (this.state.runNumber == null) {
            this.state.runNumber = 0;
        }
        ++this.state.runNumber;
        var sampleCount = data.length;
        var items = [];
        for (var i = 0; i < sampleCount; i++) {
            var entry = data[i];
            var time = entry[0];
            var value = entry[1];
            var item = { Run: this.state.runNumber, Time: time };
            item[dataType] = value;
            items.push(item);
        }
        this.prepAndSend(items, [dataType]);
    }
    prepAndSend(items, dataTypes) {
        // Determine if CODAP already has the Data Context we need.
        this.requestDataContext().then((iResult) => {
            // if we did not find a data set, make one
            if (iResult && !iResult.success) {
                // If not not found, create it.
                return this.requestCreateDataSet();
            }
            else {
                // else we are fine as we are, so return a resolved promise.
                return Promise.resolve(iResult);
            }
        }).then((iResult) => {
            // make sure the Data Context has the current data type
            return this.updateDataContext(dataTypes);
        }).then((iResult) => {
            this.guaranteeCaseTable().then((iResult) => {
                CodapInterface.sendRequest({
                    action: 'create',
                    resource: 'dataContext[' + this.dataSetName + '].item',
                    values: items
                }, this.responseCallback);
            });
        });
    }
    sendDualData(data1, data1Type, data2, data2Type) {
        // if a run number has not yet been initialized, do so now.
        if (this.state.runNumber == null) {
            this.state.runNumber = 0;
        }
        ++this.state.runNumber;
        var sampleCount = Math.max(data1.length, data2.length);
        var items = [];
        var collection = this.dataSetTemplate.collections[1];
        collection.attrs[1] = { name: data1Type, type: 'numeric', precision: 4 };
        collection.attrs[2] = { name: data2Type, type: 'numeric', precision: 4 };
        for (var i = 0; i < sampleCount; i++) {
            var entry1 = data1[i];
            var entry2 = data2[i];
            var time = entry1[0];
            var value1 = entry1[1];
            var value2 = entry2[1];
            var item = { Run: this.state.runNumber, Time: time };
            item[data1Type] = value1;
            item[data2Type] = value2;
            items.push(item);
        }
        this.prepAndSend(items, [data1Type, data2Type]);
    }
}
exports.Codap = Codap;


/***/ }),

/***/ 273:
/***/ (function(module, exports, __webpack_require__) {

// ==========================================================================
//
//  Author:   jsandoe
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

/**
 * This class is intended to provide an abstraction layer for managing
 * a CODAP Data Interactive's connection with CODAP. It is not required. It is
 * certainly possible for a data interactive, for example, to use only the
 * iFramePhone library, which manages the connection at a lower level.
 *
 * This object provides the following services:
 *   1. Initiates the iFramePhone interaction with CODAP.
 *   2. Provides information on the status of the connection.
 *   3. Provides a sendRequest method. It accepts a callback or returns a Promise
 *      for handling the results from CODAP.
 *   4. Provides a subscriber interface to receive selected notifications from
 *      CODAP.
 *   5. Provides automatic handling of Data Interactive State. Prior to saving
 *      a document CODAP requests state from the Data Interactive, where state
 *      is an arbitrary serializable object containing whatever the data
 *      interactive needs to retain. It returns this state when the document
 *      is reopened.
 *   6. Provides a utility to parse a resource selector into its component parts.
 *
 * @type {Object}
 *
 * Usage Notes:
 *
 *  * With plain ol' script tags:
 *
 *    * In HTML
 *
 *      <script src=".../iframe-phone.js"></script>
 *      <script src=".../CodapInterface.js"></script>
 *      ...
 *
 *    * In Javascript
 *
 *      codapInterface.init({...});
 *      ...
 *
 *  * In a module packager (e.g. webpack):
 *
 *    * Installation
 *
 *      % npm install --save iframe-phone
 *
 *    * In calling module (e.g. my-module.js)
 *
 *      var iframePhone = require('.../CodapInterface');
 *      ...
 *      codapInterface.init({...});
 *
 *    * Packaging
 *
 *      % webpack my-module.js app.js
 *
 */

/*global require, iframePhone, Promise, module */

(function (global) {

  var iframePh = ( true)? __webpack_require__(119) : iframePhone;

  var config = null;

  /**
   * The CODAP Connection
   * @param {iframePhone.IframePhoneRpcEndpoint}
   */
  var connection = null;

  var connectionState = 'preinit';

  var stats = {
    countDiReq: 0,
    countDiRplSuccess: 0,
    countDiRplFail: 0,
    countDiRplTimeout: 0,
    countCodapReq: 0,
    countCodapUnhandledReq: 0,
    countCodapRplSuccess: 0,
    countCodapRplFail: 0,
    timeDiFirstReq: null,
    timeDiLastReq: null,
    timeCodapFirstReq: null,
    timeCodapLastReq: null
  };

  /**
   * A serializable object shared with CODAP. This is saved as a part of the
   * CODAP document. It is intended for the data interactive's use to store
   * any information it may need to reestablish itself when a CODAP document
   * is saved and restored.
   *
   * This object will be initially empty. It will be updated during the process
   * initiated by the init method if CODAP was started from a previously saved
   * document.
   */
  var interactiveState = {};

  /**
   * A list of subscribers to messages from CODAP
   * @param {[{actionSpec: {RegExp}, resourceSpec: {RegExp}, handler: {function}}]}
   */
  var notificationSubscribers = [];

  function matchResource(resourceName, resourceSpec) {
    return resourceSpec === '*' || resourceName === resourceSpec;
  }

  function notificationHandler (request, callback) {
    var action = request.action;
    var resource = request.resource;
    var requestValues = request.values;
    var returnMessage = {success: true};

    connectionState = 'active';
    stats.countCodapReq += 1;
    stats.timeCodapLastReq = new Date();
    if (!stats.timeCodapFirstReq) {
      stats.timeCodapFirstReq = stats.timeCodapLastReq;
    }

    if (action === 'notify' && !Array.isArray(requestValues)) {
      requestValues = [requestValues];
    }

    var handled = false;
    var success = true;

    if (action === 'get') {
      // get assumes only one subscriber because it expects only one response.
      notificationSubscribers.some(function (subscription) {
        var result = false;
        try {
          if ((subscription.actionSpec === action) &&
              matchResource(resource, subscription.resourceSpec)) {
            var rtn = subscription.handler(request);
            if (rtn && rtn.success) { stats.countCodapRplSuccess++; } else{ stats.countCodapRplFail++; }
            returnMessage = rtn;
            result = true;
          }
        } catch (ex) {
          console.log('DI Plugin notification handler exception: ' + ex);
          result = true;
        }
        return result;
      });
      if (!handled) {
        stats.countCodapUnhandledReq++;
      }
    } else if (action === 'notify') {
      requestValues.forEach(function (value) {
        notificationSubscribers.forEach(function (subscription) {
          // pass this notification to matching subscriptions
          handled = false;
          if ((subscription.actionSpec === action) && matchResource(resource,
                  subscription.resourceSpec) && (!subscription.operation ||
              (subscription.operation === value.operation) && subscription.handler)) {
            var rtn = subscription.handler(
                {action: action, resource: resource, values: value});
            if (rtn && rtn.success) { stats.countCodapRplSuccess++; } else{ stats.countCodapRplFail++; }
            success = (success && (rtn ? rtn.success : false));
            handled = true;
          }
        });
        if (!handled) {
          stats.countCodapUnhandledReq++;
        }
      });
    } else {
      console.log("DI Plugin received unknown message: " + JSON.stringify(request));
    }
    return callback(returnMessage);
  }

  var codapInterface = {
    /**
     * Connection statistics
     */
    stats: stats,

    /**
     * Initialize connection.
     *
     * Start connection. Request interactiveFrame to get prior state, if any.
     * Update interactive frame to set name and dimensions and other configuration
     * information.
     *
     * @param iConfig {object} Configuration. Optional properties: title {string},
     *                        version {string}, dimensions {object}
     *
     * @param iCallback {function(interactiveState)}
     * @return {Promise} Promise of interactiveState;
     */
    init: function (iConfig, iCallback) {
      return new Promise(function (resolve, reject) {
        function getFrameRespHandler(resp) {
          var success = resp && resp[1] && resp[1].success;
          var receivedFrame = success && resp[1].values;
          var savedState = receivedFrame && receivedFrame.savedState;
          this_.updateInteractiveState(savedState);
          if (success) {
            // deprecated way of conveying state
            if (iConfig.stateHandler) {
              iConfig.stateHandler(savedState);
            }
            resolve(savedState);
          } else {
            if (!resp) {
              reject('Connection request to CODAP timed out.');
            } else {
              reject(
                  (resp[1] && resp[1].values && resp[1].values.error) ||
                  'unknown failure');
            }
          }
          if (iCallback) {
            iCallback(savedState);
          }
        }

        var getFrameReq = {action: 'get', resource: 'interactiveFrame'};
        var newFrame = {
          name: iConfig.name,
          title: iConfig.title,
          version: iConfig.version,
          dimensions: iConfig.dimensions,
          preventBringToFront: iConfig.preventBringToFront
        };
        var updateFrameReq = {
          action: 'update',
          resource: 'interactiveFrame',
          values: newFrame
        };
        var this_ = this;

        config = iConfig;

        // initialize connection
        connection = new iframePh.IframePhoneRpcEndpoint(
            notificationHandler, "data-interactive", window.parent);

        this.on('get', 'interactiveState', function () {
          return ({success: true, values: this.getInteractiveState()});
        }.bind(this));

        console.log('sending interactiveState: ' + JSON.stringify(this.getInteractiveState));
        // update, then get the interactiveFrame.
        return this.sendRequest([updateFrameReq, getFrameReq])
          .then(getFrameRespHandler, reject);
      }.bind(this));
    },

    /**
     * Current known state of the connection
     * @param {'preinit' || 'init' || 'active' || 'inactive' || 'closed'}
     */
    getConnectionState: function () {return connectionState;},

    getStats: function () {
      return stats;
    },

    getConfig: function () {
      return config;
    },

    /**
     * Returns the interactive state.
     *
     * @returns {object}
     */
    getInteractiveState: function () {
      return interactiveState;
    },

    /**
     * Updates the interactive state.
     * @param iInteractiveState {Object}
     */
    updateInteractiveState: function (iInteractiveState) {
      if (!iInteractiveState) {
        return;
      }
      interactiveState = Object.assign(interactiveState, iInteractiveState);
    },

    destroy: function () {
      // todo : more to do?
      connection = null;
    },

    /**
     * Sends a request to CODAP. The format of the message is as defined in
     * {@link https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API}.
     *
     * @param message {{
        action:string,
        resource:string,
        values?:any}}
     * @param callback {function(response, request)} Optional callback to handle
     *    the CODAP response. Note both the response and the initial request will
     *    sent.
     *
     * @return {Promise} The promise of the response from CODAP.
     */
    sendRequest: function (message, callback) {
      return new Promise(function (resolve, reject){
        function handleResponse (request, response, callback) {
          if (response === undefined) {
            console.warn('handleResponse: CODAP request timed out');
            reject('handleResponse: CODAP request timed out: ' + JSON.stringify(request));
            stats.countDiRplTimeout++;
          } else {
            connectionState = 'active';
            if (response.success) { stats.countDiRplSuccess++; } else { stats.countDiRplFail++; }
            resolve(response);
          }
          if (callback) {
            callback(response, request);
          }
        }
        switch (connectionState) {
          case 'closed': // log the message and ignore
            console.warn('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
            reject('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
            break;
          case 'preinit': // warn, but issue request.
            console.log('sendRequest on not yet initialized CODAP connection: ' +
                JSON.stringify(message));
            /* falls through */
          default:
            if (connection) {
              stats.countDiReq++;
              stats.timeDiLastReq = new Date();
              if (!stats.timeDiFirstReq) {
                stats.timeCodapFirstReq = stats.timeDiLastReq;
              }

              connection.call(message, function (response) {
                handleResponse(message, response, callback);
              });
            } else {
              console.error('sendRequest on non-existent CODAP connection');
            }
        }
      });
    },

    /**
     * Registers a handler to respond to CODAP-initiated requests and
     * notifications. See {@link https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API#codap-initiated-actions}
     *
     * @param actionSpec {'get' || 'notify'} (optional) Action to handle. Defaults to 'notify'.
     * @param resourceSpec {String} A resource string.
     * @param operation {String} (optional) name of operation, e.g. 'create', 'delete',
     *   'move', 'resize', .... If not specified, all operations will be reported.
     * @param handler {Function} A handler to receive the notifications.
     */
    on: function (actionSpec, resourceSpec, operation, handler) { // eslint-disable-line no-unused-vars
      var as = 'notify',
          rs,
          os,
          hn;
      var args = Array.prototype.slice.call(arguments);
      if (args[0] === 'get' || args[0] === 'notify') {
        as = args.shift();
      }
      rs = args.shift();
      if (typeof args[0] !== 'function') {
        os = args.shift();
      }
      hn = args.shift();

      notificationSubscribers.push({
        actionSpec: as,
        resourceSpec: rs,
        operation: os,
        handler: hn
      });
    },

    /**
     * Parses a resource selector returning a hash of named resource names to
     * resource values. The last clause is identified as the resource type.
     * E.g. converts 'dataContext[abc].collection[def].case'
     * to {dataContext: 'abc', collection: 'def', type: 'case'}
     *
     * @param {String} iResource
     * @return {Object}
     */
    parseResourceSelector: function (iResource) {
      var selectorRE = /([A-Za-z0-9_-]+)\[([^\]]+)]/;
      var result = {};
      var selectors = iResource.split('.');
      selectors.forEach(function (selector) {
        var resourceType, resourceName;
        var match = selectorRE.exec(selector);
        if (selectorRE.test(selector)) {
          resourceType = match[1];
          resourceName = match[2];
          result[resourceType] = resourceName;
          result.type = resourceType;
        } else {
          result.type = selector;
        }
      });

      return result;
    }
  };

  if (true) {
    module.exports = codapInterface;
  } else {
    global.codapInterface = codapInterface;
  }
}(this));


/***/ }),

/***/ 62:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * This component is a very thin wrapper around a standard button designed to prevent
 * extraneous focus highlighting added by browsers when clicking on a button while
 * maintaining keyboard accessibility. See
 * https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
 * for details. The upshot is that we use mouse events on the button to disable the
 * focus highlight -- mousing/clicking on a push button should not be used as an
 * indicator that the user would like to keyboard-interact with that button, which
 * is what focusing a clicked button implies.
 * IMPORTANT: To maintain accessibility, there must be code somewhere to reenable
 * the focus highlight when appropriate. This can be done for 'keydown' by calling
 * enableButtonFocusHighlightOnKeyDown() during application/page initialization,
 * or by adding your own event handler that calls enableButtonFocusHighlight().
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SmartFocusHighlight {
    // Installs a keydown handler on the document which will enable button focus highlighting.
    // Should be called once during application initialization.
    static enableFocusHighlightOnKeyDown() {
        document.addEventListener('keydown', () => this.enableFocusHighlight());
    }
    // Enables button focus highlighting; designed to be called from the keydown handler above
    // but available separately for implementations that require it.
    static enableFocusHighlight() {
        const controls = document.querySelectorAll(`.${this.kSmartFocusHighlightClass}`), count = controls.length;
        // cf. https://developer.mozilla.org/en-US/docs/Web/API/NodeList#Example
        for (let i = 0; i < count; ++i) {
            const control = controls[i];
            if (control && control.className) {
                // cf. http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
                control.className = control.className.replace(/(?:^|\s)no-focus-highlight(?!\S)/g, '');
            }
        }
    }
    // prevent extraneous focus highlight on click while maintaining keyboard accessibility
    // see https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
    static suppressFocusHighlight(elt) {
        if (elt && elt.className.indexOf(this.kDisableFocusHighlightClass) < 0)
            elt.className += ' ' + this.kDisableFocusHighlightClass;
    }
}
// add to all elements to enable smart focus highlight functionality
SmartFocusHighlight.kSmartFocusHighlightClass = 'smart-focus-highlight';
// added to elements when appropriate to disable focus highlight
SmartFocusHighlight.kDisableFocusHighlightClass = 'disable-focus-highlight';
exports.default = SmartFocusHighlight;


/***/ })

},[123]);
//# sourceMappingURL=app.js.map