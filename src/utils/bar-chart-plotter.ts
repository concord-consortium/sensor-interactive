import { PREDICTION_LINE_COLOR, AUTHORED_LINE_COLOR, GRAPH1_LINE_COLOR } from "../components/graph";

// Original function was taken from https://dygraphs.com/tests/plotters.html
export const barChartPlotter = (e: any) => {
  const ctx = e.drawingContext;
  const points = e.points;
  const y_bottom = e.dygraph.toDomYCoord(0);

  ctx.fillStyle = GRAPH1_LINE_COLOR;

  let min_sep = Infinity;
  for (let i = 1; i < points.length; i++) {
    const sep = points[i].canvasx - points[i - 1].canvasx;
    if (sep < min_sep) min_sep = sep;
  }
  const bar_width = Math.floor(2.0 / 3 * min_sep);

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const center_x = p.canvasx;

    ctx.fillRect(center_x - bar_width / 2, p.canvasy,
        bar_width, y_bottom - p.canvasy);

    ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
        bar_width, y_bottom - p.canvasy);
  }
}

// Multiple column bar chart
export const multiColumnBarPlotter = (e: any) => {
      // We need to handle all the series simultaneously.
      if (e.seriesIndex !== 0) return;
      const g = e.dygraph;
      const ctx = e.drawingContext;
      const sets = e.allSeriesPoints;
      const y_bottom = e.dygraph.toDomYCoord(0);

      // Find the minimum separation between x-values.
      // This determines the bar width.
      let min_sep = Infinity;
      for (let j = 0; j < sets.length; j++) {
        const points = sets[j];
        for (let i = 1; i < points.length; i++) {
          let sep = points[i].canvasx - points[i - 1].canvasx;
          if (sep < min_sep) min_sep = sep;
        }
      }
      const bar_width = Math.floor(2.0 / 3 * min_sep);

      let fillColors = [];
      const strokeColors = g.getColors();
      const otherColors = [];

      if (sets.length === 3) {
        otherColors.push(AUTHORED_LINE_COLOR, PREDICTION_LINE_COLOR, GRAPH1_LINE_COLOR)
      } else if (sets.length === 2) {
        // TODO: Determine whether authored or prediction data is present
        // and use color specific for that type of data instead of simply
        // using authored color. It may be possible to pass the correct
        // colors in from the Graph component via the Dygraph options.
        otherColors.push(AUTHORED_LINE_COLOR, GRAPH1_LINE_COLOR);
      };

      for (let i = 0; i < strokeColors.length; i++) {
        fillColors.push(otherColors[i]);
      }

      for (let j = 0; j < sets.length; j++) {
        ctx.fillStyle = fillColors[j];
        ctx.strokeStyle = fillColors[j];
        for (let i = 0; i < sets[j].length; i++) {
          const p = sets[j][i];
          const center_x = p.canvasx;
          const x_left = center_x - (bar_width / 2) * (1 - j/(sets.length-1));

          ctx.fillRect(x_left, p.canvasy,
              bar_width/sets.length, y_bottom - p.canvasy);

          ctx.strokeRect(x_left, p.canvasy,
              bar_width/sets.length, y_bottom - p.canvasy);
        }
      }
    }