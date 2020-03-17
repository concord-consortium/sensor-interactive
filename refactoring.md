## Configuration

**sensorManagerList**: this can be null to use the default list of sensorManagers, or it can include a subset of sensorManagers. This list will affect the connection actions list.

**onSensorData**: callback. It is passed a newSensorData object which is a map of sensor ids to an array of data: `[[time, value], [time, value], ...]` The time is always in seconds from the start of the collection. The sensor ids matches the ids of the sensors from the selectedSensor array. The app needs to store this data in its own structures. In other words the library will not automatically store the sensor data in the Sensor objects.

**onDialogRequest**: callback. Library sends question to the app that includes a prompt and a set of short answer options. Typically these will be shown in a dialog with the options being shown as the text on buttons. App uses dialogResponse action to send choice back to the library
Here are the 4 dialogs currently used by the sensor interactive:
- not responding dialog (shows when onCommunicationError is received)
- sensor not attached dialog
- bluetooth connection failed
- sensor disconnection warning

## Readonly State

**status message**: library updates the status message and it should be displayed by app.

**connected**: if any sensor or service is connected.
  _in the current code this is often done by checking for `this.state.sensorManager`. Separately, there is also `this.props.sensorManager` which indicates that a specific sensorManager was pre selected for use by the app. See the sensorManager list above for supporting this._

**collecting**: if data is being collected

**list of connection actions**: an array of actions to start a connection, based on the current configuration of the library(see below). It currently includes:
  - Wired: connect to sensor connector
  - Wireless: bring up the browsers BLE dialog with filters based on configured sensor managers

**sensorDescriptions**: a list of SensorDescription objects that represent the available sensors on the currently connected device. These descriptions can be passed to createSensor in order to configure the selectedSensor array. The array of descriptions can change depending on which device the user choose to connect to. This could be when they are using the bluetooth dialog to choose a sensor. Or it could be when the user connects or disconnects a sensor from an physical interface box which supports multiple sensors. These descriptions do not have live values.

Each sensor description has:


## Read-write State

**selectedSensors**: this is an array of sensors that will be collected from and provide live values.  They are of type Sensor (see below).

The app can modify the selectedSensor array by adding objects to it. These objects can either be:
- the result of calling createSensor to make a sensor object (see below)
- `null` to represent a removed sensor.

Here is how the library works with the array. When the library gets the onConnection event from a sensorManager, the library updates the sensors in the selectedSensor array. It matches up any sensor descriptions from the sensorManager with the Sensors in the array. _See existing matchSensorsToDataColumns method_

## Methods

**connect**: How the app triggers a connection the type of connection should be specified. See the list of connection actions in the state above.

**disconnect**: see the discussion below. This could be a single disconnect method which assumes there is always only one device/service connected to, or it there could be an intermediate object representing the device/service connected to, and that device would have the disconnect method on it.

**dialogResponse**: When the user chooses an answer to a dialog the app sends it back to the library, along with an id identifying the dialog request.

**createSensor**: This is how the app gets Sensor objects to add to the selectedSensors array. It can be called either with sensorDescription or a string representing a unit.

**reload**: This can be used by the app to force a reload of the resources used by the library. _In the current code this tries to restart the sensor connector_

**startCollecting**: _In the current code this is startSensor_

**stopCollecting**: _In the current code this is stopSensor_

## Models

### Sensor

**tareValue**

**unit** _valueUnit  in existing code_

**value** _sensorValue in existing code_

**tareable** _definition.tareable in existing code_

**precision**

**id** _columnId in existing code_ this is used to identify the sensor when data is passed to the app in onSensorData. It also will match the id in the SensorDescription object so it is possible to match them up

**zeroSensor()**

**removeSensor()**

### SensorDescription

**measurementName** for example "Motion" for a motion sensor

**measurementType** for example "position" for a motion sensor

**units**

**tareable?** field on old description, it isn't clear if it is needed on the description, it might be fine to just have it on the Sensor

**minReading?** this is probably only needed by the graph, so putting on the Sensor object might make more sense. However knowing the min can be useful if the sensor provides multiple options and the user needs to select one. Or there is some automatic selection process which can use this info.

**maxReading?** this is probably only needed by the graph, so putting on the Sensor object might make more sense. However knowing the min can be useful if the sensor provides multiple options and the user needs to select one. Or there is some automatic selection process which can use this info.

**id** there might be more than one sensor with the same name and unit. Additionally this id can be used to match up the sensor description with a Sensor object in the selectedSensors array.

# TODO

Review the differences between the app and numeric-display-demo because this design was mostly made by looking at the more simple numeric-display-demo. Examples of methods that the app needs are reload, startCollecting, and stopCollecting.  The main difference is the ControlPanel component, but there are probably a few more.

# Refactoring Notes

The code currently has a timeUnit. In this new api the time values of the data returned in onSensorData are always seconds. So there is no need to have a time unit.
