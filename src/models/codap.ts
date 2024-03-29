import CodapInterface from "../js/CodapInterface";

interface IAttribute {
    name:string;
    type:string;
    unit?:string;
    precision?:number;
}

interface ICollection {
    name:string;
    parent?:string;
    labels?:{ pluralCase:string, setOfCasesWithArticle:string };
    attrs:IAttribute[];
}

interface IDataSetTemplate {
    name: string;
    collections: ICollection[];
}

interface IDataItem {
    Run:number;
    Time?:number;
    [key:string]:number|undefined;
}

export interface IDataSpec {
    name: string;
    unit: string;
    data: number[][];
}

export class Codap {

    private state:any = {};

    private dataSetName:string = "sensor_interactive";
    private dataSetTitle:string = "Sensor Interactive";
    private dataSetAttrs:IAttribute[] = [{name: "Time", type: 'numeric', unit: "s", precision: 3}];

    private dataSetTemplate:IDataSetTemplate = {
        name: "{name}",
        collections: [
          {
            name: 'runs',
            attrs: [ {name: "Run", type: 'categorical'}],
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

    constructor(onInitialState: (initialState:any) => void) {
        CodapInterface.init({
            name: this.dataSetName,
            title: this.dataSetTitle,
            dimensions: {width: 800, height: 490},
            version: '0.1',
            preventDataContextReorg: false
        }, this.responseCallback).then((iResult) => {
            // get interactive state so we can save the data set index.
            this.state = CodapInterface.getInteractiveState();
            if (onInitialState)
                onInitialState(this.state);

            // determine the run number of the last case in the collection.
            const runsCollection = `dataContext[${this.dataSetName}].collection[runs]`;
            // determine the number of cases
            CodapInterface.sendRequest({
                action: 'get',
                resource: `${runsCollection}.caseCount`
            }, this.responseCallback)
            .then((response: any) => {
                if (response.success) {
                    // request the last case
                    const caseCount = response.values;
                    if (caseCount > 0) {
                        CodapInterface.sendRequest({
                            action: 'get',
                            resource: `${runsCollection}.caseByIndex[${caseCount-1}]`
                        }, this.responseCallback)
                        .then((response: any) => {
                            // retrieve the run number from the last case
                            if (response.success) {
                                const theCase = response.values['case'];
                                this.state.runNumber = theCase.values.Run;
                            }
                        }, this.responseCallback);
                    }
                    else {
                        this.state.runNumber = 0;
                    }
                }
            });
        });
    }

    responseCallback(response:any) {
        if(response) {
            //console.log("codap response: success=" + response.success);
        }
    }

    updateInteractiveState(state:any) {
        CodapInterface.updateInteractiveState(state);
        // log the state change, which dirties the document
        CodapInterface.sendRequest({
            action: 'notify',
            resource: 'logMessage',
            values: {
                formatStr: "updateInteractiveState: %@",
                replaceArgs: JSON.stringify(state)
            }
        }, this.responseCallback);
    }

    requestDataContext():Promise<any> {
        return CodapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + this.dataSetName + ']'
        }, this.responseCallback);
    }

    updateDataContext(dataSpecs:IDataSpec[]):Promise<any> {
        dataSpecs.forEach((spec)=>{
            var exists:boolean = false;
            this.dataSetAttrs.forEach((dataSetAttr) => {
                if(dataSetAttr.name === spec.name) {
                    exists = true;
                }
            });
            if(!exists) {
                this.dataSetAttrs.push({name: spec.name, type: 'numeric', unit: spec.unit, precision: 4});
            }
        });

        return CodapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext[' + this.dataSetName + '].collection[measurements].attribute',
            values: this.dataSetAttrs
        }, this.responseCallback);
    }

    requestCreateDataSet():Promise<any> {
        var dataSetDef = Object.assign({}, this.dataSetTemplate);
        dataSetDef.name = this.dataSetName;
        return CodapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: dataSetDef
        }, this.responseCallback);
    }

    guaranteeCaseTable():Promise<any> {
        return new Promise((resolve, reject) => {
            CodapInterface.sendRequest({
                action: 'get',
                resource: 'componentList'
            }, this.responseCallback)
            .then((iResult:any) => {
                if (iResult.success) {
                    // look for a case table in the list of components.
                    if (iResult.values && iResult.values.some(function (component:any) {
                        return component.type === 'caseTable';
                    })) {
                        resolve(iResult);
                    } else {
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
                } else {
                    reject('api error');
                }
            });
        });
    }

    sendData(dataSpec:IDataSpec) {
        const name = dataSpec.name,
              data = dataSpec.data;
        // if a run number has not yet been initialized, do so now.
        if (this.state.runNumber == null) {
            this.state.runNumber = 0;
        }

        ++this.state.runNumber;

        var sampleCount = data.length;

        var items:IDataItem[] = [];

        for(var i=0; i < sampleCount; i++) {
            var entry = data[i];
            var time = entry[0];
            var value = <number>entry[1];
            var item:IDataItem = {Run: this.state.runNumber, Time: time};
            item[name] = value;
            items.push(item);
        }

        this.prepAndSend(items, [dataSpec]);
    }

    private prepAndSend(items:any[], dataSpecs:IDataSpec[]) {
        // Determine if CODAP already has the Data Context we need.
        this.requestDataContext().then((iResult:any) => {
            // if we did not find a data set, make one
            if (iResult && !iResult.success) {
                // If not not found, create it.
                return this.requestCreateDataSet();
            } else {
                // else we are fine as we are, so return a resolved promise.
                return Promise.resolve(iResult);
            }
        }).then((iResult:any)=> {
            // make sure the Data Context has the current data type
            return this.updateDataContext(dataSpecs);
        }).then((iResult:any)=> {
            this.guaranteeCaseTable().then((iResult:any) => {
                CodapInterface.sendRequest({
                    action: 'create',
                    resource: 'dataContext[' + this.dataSetName + '].item',
                    values: items
                }, this.responseCallback);
            });
        });
    }

    sendDualData(dataSpecs:IDataSpec[]) {
        // if a run number has not yet been initialized, do so now.
        if (this.state.runNumber == null) {
            this.state.runNumber = 0;
        }

        ++this.state.runNumber;

        var sampleCount = Math.max(dataSpecs[0].data.length, dataSpecs[1].data.length);

        var items:IDataItem[] = [];
        var collection:ICollection = this.dataSetTemplate.collections[1];

        let j, spec;
        for(j=0; j < 2; j++) {
            spec = dataSpecs[j];
            collection.attrs[j+1] = {name: spec.name, type: 'numeric', unit: spec.unit, precision: 4};
        }

        for(var i=0; i < sampleCount; i++) {
            let item:IDataItem = {Run: this.state.runNumber };
            for(j=0; j < 2; j++) {
                let spec = dataSpecs[j],
                    sample = spec.data[i];
                if (item.Time == null)
                    item.Time = sample[0];
                if (sample[1] != null)
                    item[spec.name] = sample[1];
            }
            items.push(item);
        }

        this.prepAndSend(items, dataSpecs);
    }
}
