export type timeSeriesData = {
  name: string,
  data: number[][]
}

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

const lerpForTime = (source: timeSeriesData, time: number) => {
  const {data} = source;
  const firstTime =data[0][0];
  const finalTime = data[data.length - 1][0];
  if(time < firstTime) {
    return data[0][1];
  }
  if(time > finalTime) {
    return data[data.length - 1][1];
  }
  let lastValue = 0;
  let lastTime = 0;
  let index = 0
  while(data[index][0] < time) {
    lastValue = data[index][1];
    lastTime = data[index][0];
    index++;
  }
  const nextValue = data[index][1];
  const nextTime = data[index][0];
  if (nextTime === time) {
    return nextValue;
  }
  const t = (time - lastTime) / (nextTime - lastTime);
  return lerp(lastValue, nextValue, t);
}

// Given an array of time-series data, merge them into a single array
// assumptions: each array is sorted by time, and each array has two columns
// returns: an array of time-series data, with the first column being the time
// Sources with zero length are ignored for interpolation.
export const mergeTimeSeriesData = (inputSources: timeSeriesData[]) => {
  const sources = inputSources.filter(source => source.data != null && source.data.length > 0);
  if (sources.length === 0) {
    return [];
  }

  let times: number[] = [];

  // get a list of time indexes
  for(const source of sources) {
    times = times.concat(source.data.map(d => d[0]));
  }

  // Ensure the data is sorted by time (ascending)
  times = times.sort((a, b) => a - b);

  // Now make the timestamps unique:
  const uniqueTimes = times.filter((item, index) => times.indexOf(item) === index);

  const values: number[][] = [];
  let time = uniqueTimes[0];
  for(time of uniqueTimes) {
    // For each time, find the value at that time in each source.
    const valuesForTime: number[] = [];
    valuesForTime.push(time);
    for(const source of sources) {
      valuesForTime.push(lerpForTime(source, time));
    }
    values.push(valuesForTime);
  }
  return values;
};
