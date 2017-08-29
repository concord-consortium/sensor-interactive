export class Format {
    
    static getPrecision(range:number):number {
        var stepSize = range / 4000;
        var precision;
        var fixVal = 0;
        if(stepSize < 1) {
            fixVal = Math.round(-Math.log10(stepSize))+2;
        }
        
        precision = Math.log10(Math.round(stepSize)) + fixVal;
        precision = Math.max(1, Math.min(precision, 21));
        
        return precision;
    }
    
    static getFixValue(range:number):number {
        var stepSize = range / 4000;
        var precision;
        if(stepSize < 1) {
            precision = Math.round(-Math.log10(stepSize));
        } else {
            precision = 0;  //Math.round(Math.log10(Math.round(stepSize))) + 1;
        }
        precision = Math.max(0, Math.min(precision, 21));
        return precision;
    }
    
    static getAxisFix(range:number):number {
        var stepSize = range / 10;
        var precision;
        if(stepSize < 5) {
            precision = Math.round(-Math.log10(stepSize));
        } else {
            precision = 0;
        }
        precision = Math.max(0, Math.min(precision, 21));
        return precision;
    }
    
    static formatFixedValue(value:number, fix:number, unit:string="", shorthand:boolean=false):string {
        if ((value == null) || isNaN(value)) return "";
        if(shorthand && value >= 10000) {
            return (Math.round(value) / 1000) + "k " + unit;
        }
        return value.toFixed(fix) + " " + unit;
    }
}
