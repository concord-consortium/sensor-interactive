import { mergeTimeSeriesData } from './merge-timeseries-data';

test('merges dataA and dataB time series', () => {
  const dataA = [[1, 3], [3, 4]];
  const dataB = [[1, 1], [2, 2]];
  const mergedData = mergeTimeSeriesData(dataA,dataB);
  expect(mergedData.length).toBe(3);

  expect(mergedData[0][0]).toBe(1);
  expect(mergedData[0][1]).toBe(3);
  expect(mergedData[0][2]).toBe(1);

  expect(mergedData[1][0]).toBe(2);
  expect(mergedData[1][1]).toBe(3);
  expect(mergedData[1][2]).toBe(2);

  expect(mergedData[2][0]).toBe(3);
  expect(mergedData[2][1]).toBe(4);
  expect(mergedData[2][2]).toBe(2);
});