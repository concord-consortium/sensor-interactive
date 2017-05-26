export class Format {
    
    static getPrecision(range:number):number {
        var stepSize = range / 4000;
        var precision;
        if(stepSize < 1) {
            precision = Math.round(-Math.log10(stepSize));
        } else {
            precision = Math.round(Math.log10(Math.round(stepSize)));
        }
        precision = Math.min(precision, 21);
        return precision;
    }
    
    static getAxisPrecision(range:number):number {
        var stepSize = range / 40;
        var fixValue;
        if(stepSize < 1) {
            fixValue = Math.round(-Math.log10(stepSize));
        } else {
            fixValue = Math.round(Math.log10(Math.round(stepSize)));
        }
        return fixValue;
    }
    
    static formatValue(value:number, fixValue:number, unit:string=""):string {
        if(value < 10000) {
            return value.toFixed(fixValue) + " " + unit;
        } else {
            return (Math.round(value) / 1000) + "k " + unit;
        }
    }
}