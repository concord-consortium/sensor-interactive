import * as CodapInterface from "../public/assets/js/CodapInterface";

export interface IDataSetTemplate {
    name: string,
    collections: Object[]
};

export class Codap {
    
    private state:any;
    
    private dataSetName:string = "sensor_interactive";
    private dataSetTitle:string = "Sensor Interactive";
    private runIndex:number = 0;
    
    private dataSetTemplate:IDataSetTemplate = {
        name: "{name}",
        collections: [
          {
            name: 'runs',
            attrs: [ {name: "Row", type: 'categorical'}],
          },
          {
            name: 'measurements',
            parent: 'runs',
            labels: {
              pluralCase: "measurements",
              setOfCasesWithArticle: "a sample"
            },
            attrs: [
                {name: "Time", type: 'numeric', precision: 3},
                {name: "Position", type: 'numeric', precision: 4}
            ]
          }
        ]
    };
    
    constructor() {
        CodapInterface.init({
            name: this.dataSetName,
            title: this.dataSetTitle,
            dimensions: {width: 500, height: 500},
            version: '0.1'
        }, this.responseCallback).then((iResult) => {
          // get interactive state so we can save the data set index.
          this.state = CodapInterface.getInteractiveState();
          // Determine if CODAP already has the Data Context we need.
          return this.requestDataContext();
        }).then((iResult:any) => {
          // if we did not find a data set, make one
          if (iResult && !iResult.success) {
            // If not not found, create it.
            return this.requestCreateDataSet();
          } else {
            // else we are fine as we are, so return a resolved promise.
            return Promise.resolve(iResult);
          }
        }).catch(function (msg) {
          // handle errors
          console.log(msg);
        });;
    }
    
    responseCallback(param:any) {
        //console.log("codap response: " + param)
    }
    
    requestDataContext():Promise<any> {
        return CodapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + this.dataSetName + ']'
        }, this.responseCallback);
    }
    
    requestCreateDataSet():Promise<any> {
        var dataSetDef = Object.assign({}, this.dataSetTemplate);
        dataSetDef.name = this.dataSetName;
        return CodapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: dataSetDef
        }, this.responseCallback)
    }
    
    guaranteeCaseTable():Promise<any> {
      return new Promise((resolve, reject) => {
        CodapInterface.sendRequest({
          action: 'get',
          resource: 'componentList'
        }, this.responseCallback)
        .then ((iResult:any) => {
          if (iResult.success) {
            // look for a case table in the list of components.
            if (iResult.values && iResult.values.some(function (component) {
                  return component.type === 'caseTable'
                })) {
              resolve(iResult);
            } else {
              CodapInterface.sendRequest({action: 'create', resource: 'component', values: {
                type: 'caseTable',
                dataContext: this.dataSetName
              }}, this.responseCallback).then((result) => {
                resolve(result);
              });
            }
          } else {
            reject('api error');
          }
        })
      });
    }

        
    sendData(data:(number|Date)[][]):Promise<any> {
        // if a sample number has not yet been initialized, do so now.
        if (this.state.sampleNumber === undefined || this.state.sampleNumber === null) {
            this.state.sampleNumber = 0;
        }
        
        ++this.runIndex;

        var sampleCount = data.length;
        var sampleIndex = ++this.state.sampleNumber;
        
        var items:{Row:number, Time:number, Position:number}[] = [];
        
        for(var i=0; i < sampleCount; i++) {
            var entry = data[i];
            var date = <Date>entry[0];
            var time = date.getSeconds() + date.getMilliseconds()/1000;
            var value = <number>entry[1];
            items.push({Row: this.runIndex, Time: time, Position: value});
        }
        
        this.guaranteeCaseTable();
        
        return CodapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext[' + this.dataSetName + '].item',
            values: items
        }, this.responseCallback);
    }
}