type timeSeriesData = number[][];

// Given two input arrays of time series data, merge them into a single array
// where each element is a triplet of  numbers representing a time value of a and b.
export const mergeTimeSeriesData = (dataA: timeSeriesData, dataB:timeSeriesData) => {

  // First just get a list of time indexes:
  let times = dataA.map(d => d[0]).concat(dataB.map(d => d[0]));
  times = times.sort((a, b) => a - b); // sort ascending
  // Now make the data unique:
  let uniqueTimes = times.filter((item, index) => times.indexOf(item) === index);

  const valueAtTime = (array:timeSeriesData, timeIndex:number, notFound=0) => {
    const found = array.find(d => d[0] === uniqueTimes[timeIndex]);
    if(found) {
      return found[1];
    }
    return notFound;
  }

  let lastDataA = dataA[0][1];
  let lastDataB = dataB[0][1];
  const data = uniqueTimes.map(t => {
    lastDataA = valueAtTime(dataA, uniqueTimes.indexOf(t), lastDataA);
    lastDataB = valueAtTime(dataB, uniqueTimes.indexOf(t), lastDataB);
    return [t, lastDataA, lastDataB];
  });

  return data;
};
