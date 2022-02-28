type timeSeriesData = number[][];

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

const lerpForTime = (array: timeSeriesData, time: number) => {
  const firstTime =array[0][0];
  const finalTime = array[array.length - 1][0];
  if(time < firstTime) {
    return array[0][1];
  }
  if(time > finalTime) {
    return array[array.length - 1][1];
  }
  let lastValue = 0;
  let lastTime = 0;
  let index = 0
  while(array[index][0] < time) {
    lastValue = array[index][1];
    lastTime = array[index][0];
    index++;
  }
  const nextValue = array[index][1];
  const nextTime = array[index][0];
  if (nextTime === time) {
    return nextValue;
  }
  const t = (time - lastTime) / (nextTime - lastTime);
  return lerp(lastValue, nextValue, t);
}

// Given two input arrays of time series data, merge them into a single array
// where each element is a triplet of  numbers representing a time value of a and b.
export const mergeTimeSeriesData = (dataA: timeSeriesData, dataB:timeSeriesData) => {
  // check for zero length data arrays. TBD: should we throw an error?
  if(dataA.length === 0) {
    console.error('mergeTimeSeriesData: dataA is zero length');
    if(dataB.length === 0) {
      console.error('mergeTimeSeriesData: both dataA and dataB are zero length');
      return [];
    }
    return dataB;
  }
  if(dataB.length === 0) {
    console.error('mergeTimeSeriesData: dataB is zero length');
    return dataA;
  }

  // First just get a list of time indexes:
  let times = dataA.map(d => d[0]).concat(dataB.map(d => d[0]));
  times = times.sort((a, b) => a - b); // sort ascending
  // Now make the data unique:
  let uniqueTimes = times.filter((item, index) => times.indexOf(item) === index);


  let lastDataA = dataA[0][1];
  let lastDataB = dataB[0][1];
  const data = uniqueTimes.map(t => {
    lastDataA = lerpForTime(dataA, t);
    lastDataB = lerpForTime(dataB, t);
    return [t, lastDataA, lastDataB];
  });

  return data;
};
