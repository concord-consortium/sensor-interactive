const maxSamples = 600;

const interpolateValue = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
}

export const downSample = (samples: number[][]): number[][] => {
  const sampleCount = samples.length;

  if (sampleCount <= maxSamples) {
    return samples;
  }

  const result: number[][] = [];
  const step = sampleCount / maxSamples;
  const lastSampleIndex = sampleCount - 1;

  for (let i = 0; i < maxSamples; i++) {
    const index = i * step;
    const lowerIndex = Math.min(lastSampleIndex, Math.floor(index));
    const upperIndex = Math.min(lastSampleIndex, Math.ceil(index));
    const factor = index - lowerIndex;

    const lowerItem = samples[lowerIndex];
    const upperItem = samples[upperIndex];

    const interpolatedTime = interpolateValue(lowerItem[0], upperItem[0], factor);
    const interpolatedValue = interpolateValue(lowerItem[1], upperItem[1], factor);

    result.push([interpolatedTime, interpolatedValue]);
  }

  return result;
}
