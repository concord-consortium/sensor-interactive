import { PREDICTION_LINE_COLOR, AUTHORED_LINE_COLOR, GRAPH1_LINE_COLOR } from "../components/graph";

// Original function was taken from https://dygraphs.com/tests/plotters.html
export const barChartPlotter = (e: any) => {
  const ctx = e.drawingContext;
  const points = e.points;
  const yBottom = e.dygraph.toDomYCoord(0);

  ctx.fillStyle = GRAPH1_LINE_COLOR;

  let minSep = Infinity;
  for (let i = 1; i < points.length; i++) {
    const sep = points[i].canvasx - points[i - 1].canvasx;
    if (sep < minSep) minSep = sep;
  }
  const barWidth = Math.floor(2.0 / 3 * minSep);

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const centerX = p.canvasx;

    ctx.fillRect(centerX - barWidth / 2, p.canvasy,
        barWidth, yBottom - p.canvasy);

    ctx.strokeRect(centerX - barWidth / 2, p.canvasy,
        barWidth, yBottom - p.canvasy);
  }
}

// TODO: Consolidate the three plotter functions below into one.
// The main reason there are three now is for the different colors
// needed for the different types of data that can be present.
// There should be a way to specify those colors in the Dygraph
// options, though we weren't able to make it work. There is also
// an issue with displaying the correct number of bars that needs 
// to be worked out. For now we set that explicitly using barCount.
export const twoColumnBarPlotterAuthored = (e: any) => {
  // We need to handle both series simultaneously.
  if (e.seriesIndex !== 0) return;
  const ctx = e.drawingContext;
  const sets = e.allSeriesPoints;
  const yBottom = e.dygraph.toDomYCoord(0);
  const barWidth = getMultiBarWidth(sets);
  const fillColors = [AUTHORED_LINE_COLOR, GRAPH1_LINE_COLOR];
  plotMultiBarGraph({
    ctx,
    sets,
    barCount: 2,
    barWidth,
    yBottom,
    fillColors
  });
}

export const twoColumnBarPlotterPrediction = (e: any) => {
  // We need to handle all the series simultaneously.
  if (e.seriesIndex !== 0) return;
  const ctx = e.drawingContext;
  const sets = e.allSeriesPoints;
  const yBottom = e.dygraph.toDomYCoord(0);
  const barWidth = getMultiBarWidth(sets);
  const fillColors = [PREDICTION_LINE_COLOR, GRAPH1_LINE_COLOR];
  plotMultiBarGraph({
    ctx,
    sets,
    barCount: 2,
    barWidth,
    yBottom,
    fillColors
  });
}

export const threeColumnBarPlotter = (e: any) => {
  if (e.seriesIndex !== 0) return;
  const ctx = e.drawingContext;
  const sets = e.allSeriesPoints;
  const yBottom = e.dygraph.toDomYCoord(0);
  const barWidth = getMultiBarWidth(sets);
  const fillColors = [AUTHORED_LINE_COLOR, PREDICTION_LINE_COLOR, GRAPH1_LINE_COLOR];
  plotMultiBarGraph({
    ctx,
    sets,
    barCount: 3,
    barWidth,
    yBottom,
    fillColors
  });
}

const getMultiBarWidth = (sets: any) => {
  // Find the minimum separation between x-values.
  // This determines the bar width.
  let minSep = Infinity;
  for (let j = 0; j < sets.length - 1; j++) {
    const points = sets[j];
    for (let i = 1; i < points.length; i++) {
      const sep = points[i].canvasx - points[i - 1].canvasx;
      if (sep < minSep) minSep = sep;
    }
  }
  return Math.floor(2.0 / 3 * minSep);
}

const plotMultiBarGraph = (params: Record<string, any>) => {
  const { ctx, sets, barCount, barWidth, yBottom, fillColors } = params;
  for (let j = 0; j < barCount; j++) {
    ctx.fillStyle = fillColors[j];
    ctx.strokeStyle = fillColors[j];
    for (let i = 0; i < sets[j].length; i++) {
      const p = sets[j][i];
      const centerX = p.canvasx;
      let xLeft = centerX;
      if (j === 0) {
        xLeft -= (barWidth/sets.length) + 1;
      }
      if (j === 2) {
        xLeft += (barWidth/sets.length) + 1;
      }
      ctx.fillRect(xLeft, p.canvasy,
          ((barWidth/sets.length)), yBottom - p.canvasy);

      ctx.strokeRect(xLeft, p.canvasy,
          ((barWidth/sets.length)), yBottom - p.canvasy);
    }
  }
}