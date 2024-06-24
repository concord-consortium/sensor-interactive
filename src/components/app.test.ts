import { SensorSlot } from "../models/sensor-slot";
import { Sensor } from "../models/sensor";
import { matchSensorsToDataColumns } from "./app";
import { SensorConfigColumnInfo } from "@concord-consortium/sensor-connector-interface";
import { ISensorConfigurationColumnInfo } from "../models/sensor-configuration";

function newColumn(column: Partial<SensorConfigColumnInfo>) {
    return {
        id: "",
        setID: "",
        position: 0,
        name: "",
        units: "",
        liveValue: "",
        liveValueTimeStamp: new Date(),
        valueCount: 0,
        valuesTimeStamp: new Date(),
        ...column
    }
}

interface ISensorProps {
    columnID?: string;
    valueUnit?: string;
    sensorPosition?: number;
};

function newSensor(sensorProps: ISensorProps) {
    const sensor = new Sensor();
    Object.entries(sensorProps).forEach(([key, val]) => {
        (sensor as any)[key] = val;
    });
    return sensor;
}

describe("app", () => {
    describe("matchSensorsToDataColumns", () => {
        it("can be called with null columns", () => {
            const sensor0 = new Sensor();
            const sensor1 = new Sensor();
            const sensorSlots = [new SensorSlot(0, sensor0), new SensorSlot(1, sensor1)];
            const newSlots = matchSensorsToDataColumns(sensorSlots, null);
            expect(newSlots).toBe(sensorSlots);

            // It should make a new sensor objects regardless of the old ones
            expect(newSlots[0].sensor).not.toBe(sensor0);
            expect(newSlots[1].sensor).not.toBe(sensor1);
            expect(newSlots[0].sensor.columnID).toBeUndefined();
            expect(newSlots[1].sensor.columnID).toBeUndefined();
        });

        it("matches by column id first", () => {
            const sensorSlots = [
                new SensorSlot(0, newSensor({
                    columnID: "901",
                    valueUnit: "m"
                })),
                new SensorSlot(1, newSensor({}))
            ];
            const columns: SensorConfigColumnInfo[] = [
                newColumn({
                    id: "900",
                    units: "m",
                }),
                newColumn({
                    id: "901",
                    units: "lux",
                }),
                newColumn({
                    id: "902",
                    units: "N",
                })
            ];
            matchSensorsToDataColumns(sensorSlots, columns);

            // Even though the first column has a matching unit to the first
            // existing sensor, the second column is matched instead because 
            // its column id is the same.
            // TODO: It isn't obvious why the code behaves this way, so 
            // we need to document why it does.
            // I believe in the case of the sensor-connector REST API which
            // was modeled on the LabQuest sensor API, the column ids are 
            // updated on every new collection.
            expect(sensorSlots[0].sensor).toMatchObject({
                columnID: "901",
                valueUnit: "lux"
            })
            expect(sensorSlots[1].sensor).toMatchObject({
                columnID: "900",
                valueUnit: "m"
            })
        });

        it("matches by sensor position and units second", () => {
            const sensorSlots = [
                new SensorSlot(0, newSensor({
                    columnID: "1",
                    valueUnit: "lux",
                    sensorPosition: 1
                })),
                new SensorSlot(1, newSensor({}))
            ];
            const columns: SensorConfigColumnInfo[] = [
                newColumn({
                    id: "900",
                    units: "lux",
                    position: 0
                }),
                newColumn({
                    id: "901",
                    units: "lux",
                    position: 1
                }),
                newColumn({
                    id: "902",
                    units: "N",
                    position: 2
                })
            ];
            matchSensorsToDataColumns(sensorSlots, columns);

            /**
             * Even though the first column has a matching unit to the first
             * existing sensor, the second column is matched instead because 
             * its sensor position is the same.
             * {@link ISensorConfigurationColumnInfo.position} for more info.
             */
            expect(sensorSlots[0].sensor).toMatchObject({
                columnID: "901",
                valueUnit: "lux",
                sensorPosition: 1
            })
            expect(sensorSlots[1].sensor).toMatchObject({
                columnID: "900",
                valueUnit: "lux",
                sensorPosition: 0
            })
        });

        it("matches by sensor units third", () => {
            const sensorSlots = [
                new SensorSlot(0, newSensor({
                    columnID: "1",
                    valueUnit: "lux",
                    sensorPosition: 0
                })),
                new SensorSlot(1, newSensor({}))
            ];
            const columns: SensorConfigColumnInfo[] = [
                newColumn({
                    id: "900",
                    units: "m",
                    position: 0
                }),
                newColumn({
                    id: "901",
                    units: "lux",
                    position: 1
                }),
                newColumn({
                    id: "902",
                    units: "N",
                    position: 2
                })
            ];
            matchSensorsToDataColumns(sensorSlots, columns);

            // The first column has a matching position, but the units don't
            // match. So the second column is matched to the first slot instead.
            // Note: the columnID and sensorPosition are updated to be that of 
            // the matched column
            expect(sensorSlots[0].sensor).toMatchObject({
                columnID: "901",
                valueUnit: "lux",
                sensorPosition: 1
            })
            expect(sensorSlots[1].sensor).toMatchObject({
                columnID: "900",
                valueUnit: "m",
                sensorPosition: 0
            })
        });

        it("matches by position fourth", () => {
            const sensorSlots = [
                new SensorSlot(0, newSensor({
                    columnID: "1",
                    valueUnit: "lux",
                    sensorPosition: 1
                })),
                new SensorSlot(1, newSensor({}))
            ];
            const columns: SensorConfigColumnInfo[] = [
                newColumn({
                    id: "900",
                    units: "m",
                    position: 0
                }),
                newColumn({
                    id: "901",
                    units: "degC",
                    position: 1
                }),
                newColumn({
                    id: "902",
                    units: "N",
                    position: 2
                })
            ];
            matchSensorsToDataColumns(sensorSlots, columns);

            // None of the columns have a matching unit. The second column is matched
            // because it has a position matching the first slot.
            expect(sensorSlots[0].sensor).toMatchObject({
                columnID: "901",
                valueUnit: "degC",
                sensorPosition: 1
             })
            expect(sensorSlots[1].sensor).toMatchObject({
                columnID: "900",
                valueUnit: "m",
                sensorPosition: 0
            })
        });

        it("matches by anything fifth", () => {
            const sensorSlots = [
                new SensorSlot(0, newSensor({
                    columnID: "1",
                    valueUnit: "lux",
                    sensorPosition: 3
                })),
                new SensorSlot(1, newSensor({}))
            ];
            const columns: SensorConfigColumnInfo[] = [
                newColumn({
                    id: "900",
                    units: "m",
                    position: 0
                }),
                newColumn({
                    id: "901",
                    units: "degC",
                    position: 1
                }),
                newColumn({
                    id: "902",
                    units: "N",
                    position: 2
                })
            ];
            matchSensorsToDataColumns(sensorSlots, columns);

            // None of the columns have a matching unit or matching position.
            // So the first 2 columns are matched.
            expect(sensorSlots[0].sensor).toMatchObject({
                columnID: "900",
                valueUnit: "m",
                sensorPosition: 0
             })
            expect(sensorSlots[1].sensor).toMatchObject({
                columnID: "901",
                valueUnit: "degC",
                sensorPosition: 1
            })
        });

        it("ignores columns with unknown units", () => {
            const sensorSlots = [
                new SensorSlot(0, newSensor({
                    columnID: "1",
                    valueUnit: "lux",
                    sensorPosition: 0
                })),
                new SensorSlot(1, newSensor({}))
            ];
            const columns: SensorConfigColumnInfo[] = [
                newColumn({
                    id: "900",
                    units: "foo",
                    position: 0
                }),
                newColumn({
                    id: "901",
                    units: "degC",
                    position: 1
                }),
                newColumn({
                    id: "902",
                    units: "N",
                    position: 2
                })
            ];

            // Ignore console.log calls
            const mockConsoleLog = jest.spyOn(global.console, "log").mockImplementation(() => null);

            matchSensorsToDataColumns(sensorSlots, columns);

            // None of the columns have a matching unit or matching position.
            // So the first 2 columns are matched.
            expect(sensorSlots[0].sensor).toMatchObject({
                columnID: "901",
                valueUnit: "degC",
                sensorPosition: 1
             })
            expect(sensorSlots[1].sensor).toMatchObject({
                columnID: "902",
                valueUnit: "N",
                sensorPosition: 2
            })
            expect(mockConsoleLog).toBeCalled();
        });
    })
});