import * as CodapInterface from "../public/assets/js/CodapInterface";

export interface IDataSetTemplate {
    name: string;
    collections: object[];
}

export class Codap {
    
    private state:any = {};
    
    private dataSetName:string = "sensor_interactive";
    private dataSetTitle:string = "Sensor Interactive";
    private dataSetAttrs:any[] = [{name: "Time", type: 'numeric', precision: 3}];
    
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
    
    constructor() {
        CodapInterface.init({
            name: this.dataSetName,
            title: this.dataSetTitle,
            dimensions: {width: 800, height: 490},
            version: '0.1'
        }, this.responseCallback).then((iResult) => {
            // get interactive state so we can save the data set index.
            this.state = CodapInterface.getInteractiveState();

            // if the interactive run state doesn't contain a run number,
            // then determine the run number of the last case in the collection.
            if (this.state.runNumber == null) {
                const runsCollection = `dataContext[${this.dataSetName}].collection[runs]`;
                // determine the number of cases
                CodapInterface.sendRequest({
                    action: 'get',
                    resource: `${runsCollection}.caseCount`
                }, this.responseCallback)
                .then((response) => {
                    if (response.success) {
                        // request the last case
                        const caseCount = response.values;
                        CodapInterface.sendRequest({
                            action: 'get',
                            resource: `${runsCollection}.caseByIndex[${caseCount-1}]`
                        }, this.responseCallback)
                        .then((response) => {
                            // retrieve the run number from the last case
                            if (response.success) {
                                const theCase = response.values['case'];
                                this.state.runNumber = theCase.values.Run;
                            }
                        }, this.responseCallback);
                    }
                });
            }
        });
    }
    
    responseCallback(response:any) {
        if(response) {
            //console.log("codap response: success=" + response.success);
        }
    }

    requestDataContext():Promise<any> {
        return CodapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + this.dataSetName + ']'
        }, this.responseCallback);
    }
    
    updateDataContext(attrs:string[]):Promise<any> {
        console.log("updateDataContext");
        attrs.forEach((attr)=>{
            var exists:boolean = false;
            this.dataSetAttrs.forEach((dataSetAttr) => {
                if(dataSetAttr.name === attr) {
                    exists = true;
                }
            });
            if(!exists) {
                this.dataSetAttrs.push({name: attr, type: 'numeric', precision: 4});
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
        
    sendData(data:number[][], dataType:string) {
        // if a run number has not yet been initialized, do so now.
        if (this.state.runNumber == null) {
            this.state.runNumber = 0;
        }
        
        ++this.state.runNumber;

        var sampleCount = data.length;
        
        var items:any[] = [];
        
        for(var i=0; i < sampleCount; i++) {
            var entry = data[i];
            var time = entry[0];
            var value = <number>entry[1];
            var item:any = {Run: this.state.runNumber, Time: time};
            item[dataType] = value;
            items.push(item);
        }
        
        this.prepAndSend(items, [dataType]);
    }
    
    private prepAndSend(items:any[], dataTypes:string[]) {
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
            return this.updateDataContext(dataTypes);
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
    
    sendDualData(data1:number[][], data1Type:string, data2:number[][], data2Type:string) {
        // if a run number has not yet been initialized, do so now.
        if (this.state.runNumber == null) {
            this.state.runNumber = 0;
        }
        
        ++this.state.runNumber;

        var sampleCount = Math.max(data1.length, data2.length);
        
        var items:any[] = [];
        var collection:any = this.dataSetTemplate.collections[1];
        collection.attrs[1] = {name: data1Type, type: 'numeric', precision: 4};
        collection.attrs[2] = {name: data2Type, type: 'numeric', precision: 4};
        
        for(var i=0; i < sampleCount; i++) {
            var entry1 = data1[i];
            var entry2 = data2[i];
            var time = entry1[0];
            var value1 = <number>entry1[1];
            var value2 = <number>entry2[1];
            var item:any = {Run: this.state.runNumber, Time: time};
            item[data1Type] = value1;
            item[data2Type] = value2;
            items.push(item);
        }
        
        this.prepAndSend(items, [data1Type, data2Type]);
    }
}
