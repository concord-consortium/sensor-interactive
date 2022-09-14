import { precisionFixed } from "d3-format";

export class Format {
    
    static getFixValue(range:number):number {
        return precisionFixed(range / 2048);
    }
    
    static getAxisFix(axis:string, range:number, pix:number|null):number {
        // number of ticks depends on axis and width/height
        // magic numbers determined empirically from dygraphs behavior
        var step = axis === 'x' ? (pix && pix > 1460 ? range / 20 : range / 10)
                                : (pix && pix < 640 ? range / 20 : range / 10);
        return precisionFixed(step);
    }
    
    static formatFixedValue(value:number, fix:number, unit:string="", shorthand:boolean=false):string {
        if ((value == null) || isNaN(value)) return "";
        if(shorthand && value >= 10000) {
            return (Math.round(value) / 1000) + "k " + unit;
        }
        return value.toFixed(fix) + " " + unit;
    }

    static formatSingleReadBarLabel(readNum: number, data: number[][]) {
      if (readNum < 1) {
        return;
      }
      const timeElapsedIndex = data[readNum]?.length - 1;
      const secondsSinceStart = data[readNum] ? Math.round(data[readNum][timeElapsedIndex] * 10) / 10 : 0;
      const timeSinceStart = this.formatTimeValue(secondsSinceStart);
      return data[readNum] ? `Trial ${readNum}<br />${timeSinceStart}` : `Trial ${readNum}`;
    }

    static formatTimeValue(seconds: number) {
      if (seconds < 60) {
        return `${seconds} sec`;
      } else {
        const m = Math.floor(seconds % 3600/60).toString();
        const s = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${m}:${s} min`;
      }
    }
}
