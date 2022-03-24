import { cloneDeep } from "lodash";
import { SensorRecording } from "../interactive/types";
import { SensorSlot } from "./sensor-slot";

export type SensorRecordingStoreListener = (recordings: SensorRecording[]) => void;

export class SensorRecordingStore {
    private sensorRecordings: SensorRecording[] = [];
    private sensorSlotMap: WeakMap<SensorSlot, SensorRecording> = new WeakMap();
    private listeners: SensorRecordingStoreListener[] = [];
    private numRequestedDataPoints: number = 0;
    private firstDataPointTimestamp: number = 0;

    getSensorRecording(sensorSlot: SensorSlot) {
        return this.sensorSlotMap.get(sensorSlot);
    }

    configure(sensorSlots: SensorSlot[], numSensors: number) {
        const sensorRecordings: SensorRecording[] = [];

        this.sensorSlotMap = new WeakMap();
        sensorSlots.forEach((sensorSlot, index) => {
            if (index < numSensors) {
                let sensorRecording: SensorRecording;
                const sensor = sensorSlot.sensor;
                const columnID = sensor.columnID!;
                const index = this.sensorRecordings.findIndex(s => s.columnID === columnID);
                if (index !== -1) {
                    sensorRecording = this.sensorRecordings[index];
                    // remove sensor recording to guard against adding the same object twice to the array when two sensor slots have the same column id
                    this.sensorRecordings.splice(index, 1);
                } else {
                    const sensorDefinition = sensor.definition;
                    sensorRecording = {
                        columnID,
                        unit: sensor.valueUnit,
                        precision: sensor.sensorPrecision(),
                        name: sensorDefinition.measurementName,
                        min: sensorDefinition.minReading,
                        max: sensorDefinition.maxReading,
                        tareValue: sensor.tareValue,
                        sensorPosition: sensor.sensorPosition || index,
                        data: []
                    };
                }
                sensorRecordings.push(sensorRecording);
                this.sensorSlotMap.set(sensorSlot, sensorRecording);
            }
        });

        this.sensorRecordings = sensorRecordings;
        this.numRequestedDataPoints = 0;

        this.notifyListeners();
    }

    startNewRecordings() {
        this.sensorRecordings.forEach(s => s.data = []);
        this.numRequestedDataPoints = 0;
        this.notifyListeners();
    }

    setRecordings(sensorRecordings: SensorRecording[]) {
        this.sensorRecordings = cloneDeep(sensorRecordings);
        this.sensorSlotMap = new WeakMap();
        this.notifyListeners();
    }

    requestNewDataPoint() {
        this.numRequestedDataPoints++;
    }

    recordOneDataPointIfNeeded(sensorSlot: SensorSlot, sensorData: number[][]) {
        let haveAllData = false;
        const sensorRecording = this.getSensorRecording(sensorSlot);
        if (sensorRecording && (sensorData.length > 0) && sensorRecording.data.length < this.numRequestedDataPoints) {
            const sample = sensorData[0];
            // set the time offset of the data point
            if (sensorRecording.data.length === 0) {
              sample[0] = 1;
              this.firstDataPointTimestamp = Date.now();
            } else {
              sample[0] = 1 + (Date.now() - this.firstDataPointTimestamp) / 1000;
            }
            this.appendData(sensorSlot, [sample], sample[0]);
            haveAllData = sensorRecording.data.length >= this.numRequestedDataPoints;
        }
        return haveAllData;
    }

    appendData(sensorSlot: SensorSlot, sensorData: number[][], runLength: number) {
        const sensorRecording = this.getSensorRecording(sensorSlot);
        let dataChanged = false;
        if (sensorRecording) {
            const { tareValue } = sensorRecording;

            sensorData.forEach( (item) => {
              const time = item[0];
              // don't include data past the end of the experiment
              if (time <= runLength) {
                let value = item[1];
                if (tareValue) {
                  // Tare the data before appending it
                  value -= tareValue;
                }
                // TBD / For discussion:
                // Here we are removing duplicate sample data points.
                // This might be a bad idea, depending on how the data is being used.
                // this will result in a sparser data set that might require
                // consumer side interpolation to be useful in some cases.
                const length = sensorRecording.data.length;
                if (length === 0) {
                    sensorRecording.data = [...sensorRecording.data, [time, value]];
                    dataChanged = true;
                }
                else {
                    const lastValue = sensorRecording.data[sensorRecording.data.length - 1][1];
                    if (value != lastValue) {
                        sensorRecording.data = [...sensorRecording.data, [time, value]];
                        dataChanged = true;
                    }
                }
              }
            });
            if (dataChanged) {
                this.notifyListeners();
            }
        }
    }

    hasData(sensorSlot: SensorSlot): boolean {
        return this.numDataPoints(sensorSlot) > 0;
    }

    zeroSensor(sensorSlot: SensorSlot) {
      const sensorRecording = this.getSensorRecording(sensorSlot);
      if (sensorRecording) {
        sensorRecording.tareValue = sensorSlot.sensor.tareValue;
      }
    }

    numDataPoints(sensorSlot: SensorSlot):number {
        const sensorRecording = this.getSensorRecording(sensorSlot);
        return sensorRecording?.data.length || 0;
    }

    timeOfLastData(sensorSlot: SensorSlot) {
        const sensorRecording = this.getSensorRecording(sensorSlot);
        if (sensorRecording && sensorRecording.data.length > 0) {
            return sensorRecording.data[sensorRecording.data.length - 1][0];
        }
        return 0;
    }

    clearData(sensorSlot: SensorSlot) {
        const sensorRecording = this.getSensorRecording(sensorSlot);
        if (sensorRecording) {
            sensorRecording.data = [];
        }
    }

    setData(sensorSlot: SensorSlot, sensorData:number[][]) {
        const sensorRecording = this.getSensorRecording(sensorSlot);
        if (sensorRecording) {
            sensorRecording.data = sensorData;
        }
    }

    listenForNewData(listener: SensorRecordingStoreListener) {
        this.listeners.push(listener)
    }

    private notifyListeners() {
        // variable name due to spending way too long to figure out why React was blowing up (it marked the data as not extensible and then we later try to add to the data in the object)
        const cloneSoThatWhenReactMarksItAsNotExtensibleWeDontBlowUpWhenUsingThisAsAPropFactoryBean = cloneDeep(this.sensorRecordings);
        this.listeners.forEach(listener => listener(cloneSoThatWhenReactMarksItAsNotExtensibleWeDontBlowUpWhenUsingThisAsAPropFactoryBean));
    }
}