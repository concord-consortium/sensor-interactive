import { mergeTimeSeriesData, timeSeriesData } from './merge-timeseries-data';

test('merges dataA and dataB time series', () => {
  const dataA = {
    name: "dataA",
    data: [[1, 3], [3, 4], [5, 6]]
  }
  const dataB = {
    name: "dataB",
    data: [[1, 1], [2, 2]]
  };
  const mergedData = mergeTimeSeriesData([dataA, dataB]);
  expect(mergedData.length).toBe(4);

  // First time series row:
  expect(mergedData[0][0]).toBe(1);   // Specified in data
  expect(mergedData[0][1]).toBe(3);   // Specified in data
  expect(mergedData[0][2]).toBe(1);   // Specified in data

  // Second time series row:
  expect(mergedData[1][0]).toBe(2);   // Specified in data (time from dataB)
  expect(mergedData[1][1]).toBe(3.5); // Lerp missing dataA index 2: Between 3 and 4
  expect(mergedData[1][2]).toBe(2);   // Specified in data (dataB)

  // Third time series row:
  expect(mergedData[2][0]).toBe(3);  // Specified in data (time from dataA)
  expect(mergedData[2][1]).toBe(4);  // Specified in data (dataA)
  expect(mergedData[2][2]).toBe(2);  // last value of dataB we have

});

test('when one of the data arrays is zero length', () => {
  let dataA = {
    name: "dataA",
    data: [[1, 1]]
  };
  let dataB: timeSeriesData = {name: "dataB", data:[]};
  let mergedData = mergeTimeSeriesData([dataA, dataB]);
  expect(mergedData.length).toBe(1);
  dataA.data = [];
  dataB.data = [[1, 1]];
  mergedData = mergeTimeSeriesData([dataA, dataB]);
  expect(mergedData.length).toBe(1);
  dataB.data = [];
  dataA.data = [];
  mergedData = mergeTimeSeriesData([dataA, dataB]);
  expect(mergedData.length).toBe(0);
});
