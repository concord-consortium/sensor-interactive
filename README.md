
# Sensor Interactive

Sensor measuring interactive embeddable in CODAP and AP.

## Development

Run `npm start` to start webpackdevserver.
Run `npm run start:secure` to run https with certs. See `mkcert` in the SSL section below.
Run `npm run start:self-signed` to run https with self-signed certs.


## SSL Information:
First install mkcert, and install a ROOT CA for yourself:
See: https://github.com/FiloSottile/mkcert#mkcert

```
  brew install mkcert
  mkcert -install

  mkcert -cert-file ~/.localhost-ssl/localhost.crt \
    -key-file ~/.localhost-ssl/localhost.key \
    localhost 127.0.0.1 ::1
```
the `.certs` directory should be ignored by `.gitignore`
## URLS

- index.html - CODAP embeddable interactive
- interactive/index.html - AP/LARA embeddable interactive
- interactive/report-item.html - Portal dashboard report item interactive

## Available Sensors

The system defines two classes of sensors: wireless and wired.  In both cases one or more
sensor managers handle talking with the sensors to connect, disconnect and gather sensor values.

Parallel to this is a set of sensor definitions which map a unit (g, kPa, etc) to a set of
metadata about the sensor.  This definition is NOT tied to the individual sensor manager or
type but is solely based on the measurement unit that the sensor indicates it supports.
This map is defined in sensor-definition.ts.

The other repos concerned with wired sensors are:

- https://github.com/concord-consortium/sensor - this defines a Java based sensor
- https://github.com/concord-consortium/sensor-connector - this is the desktop app
- https://github.com/concord-consortium/sensor-connector-interface/ - this is the Javascript interface

The sensor types are defined in:

https://github.com/concord-consortium/sensor/blob/master/src/main/java/org/concord/sensor/SensorConfig.java

### Wired Sensors (via Sensor Connector Java desktop app and sensor-connector sensor manager)

The wired sensors connect to Sensor Connector Java desktop app which then exposes an http api
for the sensor connector manager to access via @concord-consortium/sensor-connector-interface
npm module.

### Wireless Sensors (via GDX, SensorTag and Thermoscope sensor managers)

The wireless sensors are selected with the web bluetooth UI using filters and optional services
defined in the various sensor managers.

To add new wireless sensors a new sensor manager is required per manufacturer which must include
required filters and optional services.  The connectWirelessDevice method in app.tsx must also
be extended to instantiate the new sensor manager (currently based on the what is returned in the name).

Here are the current required filters and optional services:

- required filters
  - SensorTag:
    - services: [0xaa80]
  - GDX (Vernier Go Direct)
    - namePrefix: ["GDX"]
  - Thermoscope
    - namePrefix:  "Thermoscope"

- optional services
  - SensorTag:
    - luxometer (f000aa70-0451-4000-b000-000000000000)
    - humidity (f000aa20-0451-4000-b000-000000000000)
    - IRTemperature (f000aa00-0451-4000-b000-000000000000)
    - IO (f000aa64-0451-4000-b000-000000000000)
  - GDX (Vernier Go Direct)
    - All Sensors (d91714ef-28b9-4f91-ba16-f0d9a604f112)
  - Thermoscope
    - temperatureA (f000aa00-0451-4000-b000-000000000000)
    - temperatureB (f000bb00-0451-4000-b000-000000000000)


### Deployment:
- TBD