import * as CodapInterface from "../public/assets/js/CodapInterface";

export interface IDataSetTemplate {
    name: string,
    collections: Object[]
};

export class Codap {
    
    private state:any;
    
    private dataSetName:string = "sensor_interactive";
    private dataSetTitle:string = "Sensor Interactive";
    
    private dataSetTemplate:IDataSetTemplate = {
        name: "{name}",
        collections: [  // There are two collections: a parent and a child
          {
            name: 'sensor_set',
            // The parent collection has just one attribute
            attrs: [ {name: "set_index", type: 'categorical'}],
          },
          {
            name: 'values',
            parent: 'sensor_set',
            labels: {
              pluralCase: "values",
              setOfCasesWithArticle: "a sample"
            },
            // The child collection also has just one attribute
            attrs: [
                {name: "time", type: 'numeric', precision: 2},
                {name: "value", type: 'numeric', precision: 3}
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
        console.log("codap response: " + param)
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
        
    sendData(data:number[][]):Promise<any> {
        // if a sample number has not yet been initialized, do so now.
        if (this.state.sampleNumber === undefined || this.state.sampleNumber === null) {
            this.state.sampleNumber = 0;
        }

        var sampleCount = data.length;
        var sampleIndex = ++this.state.sampleNumber;
        
        var items:{set_index:number, time:number, value:number}[] = [];
        
        for(var i=0; i < sampleCount; i++) {
            var entry = data[i];
            items.push({set_index: entry[0], time: entry[0], value: entry[1]});
        }
        
        return CodapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext[' + this.dataSetName + '].item',
            values: items
        }, this.responseCallback);
    }
}