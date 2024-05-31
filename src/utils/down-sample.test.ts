import { downSample } from "./down-sample"

describe("downSample", () => {
  it("returns samples of length less than or equal to 600 with no change", () => {
    const empty: number[][] = [];
    const oneSample: number[][] = [[0,0]];
    const sixHundredSamples: number[][] = Array(600).fill([1,2])

    expect(downSample(empty)).toBe(empty);
    expect(downSample(oneSample)).toBe(oneSample);
    expect(sixHundredSamples.length).toBe(600);
    expect(downSample(sixHundredSamples)).toBe(sixHundredSamples);
  });

  it("returns samples of length greater than 600 with 600 samples", () => {
    const sixThousandOneSamples: number[][] = [];
    for (let i = 0; i < 6001; i++) {
      sixThousandOneSamples.push([i, i * 2])
    }

    expect(sixThousandOneSamples.length).toBe(6001);
    expect(downSample(sixThousandOneSamples).length).toBe(600); // check for reduction in samples
    expect(downSample(sixThousandOneSamples)[0]).toEqual(sixThousandOneSamples[0]); // check for same initial value
    expect(downSample(sixThousandOneSamples)[1]).not.toEqual(sixThousandOneSamples[1]); // check for different interpolated second value
  });
})