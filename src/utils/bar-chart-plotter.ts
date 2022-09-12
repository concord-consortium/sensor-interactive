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

      var g = e.dygraph;
      var ctx = e.drawingContext;
      var sets = e.allSeriesPoints;
      var y_bottom = e.dygraph.toDomYCoord(0);

      // Find the minimum separation between x-values.
      // This determines the bar width.
      var min_sep = Infinity;
      for (var j = 0; j < sets.length; j++) {
        var points = sets[j];
        for (var i = 1; i < points.length; i++) {
          var sep = points[i].canvasx - points[i - 1].canvasx;
          if (sep < min_sep) min_sep = sep;
        }
      }
      var bar_width = Math.floor(2.0 / 3 * min_sep);

      var fillColors = [];
      var strokeColors = g.getColors();
      const otherColors = [];

      if (sets.length === 3) {
        otherColors.push(PREDICTION_LINE_COLOR, GRAPH1_LINE_COLOR, AUTHORED_LINE_COLOR)
      } else if (sets.length === 2) {
        otherColors.push(GRAPH1_LINE_COLOR, AUTHORED_LINE_COLOR);
      };

      for (var i = 0; i < strokeColors.length; i++) {
        fillColors.push(otherColors[i]);
      }


      for (var j = 0; j < sets.length; j++) {
        ctx.fillStyle = fillColors[j];
        ctx.strokeStyle = fillColors[j];
        for (var i = 0; i < sets[j].length; i++) {
          var p = sets[j][i];
          var center_x = p.canvasx;
          let x_left = center_x;
          if (j === 0){
            x_left -= (bar_width/sets.length) + 1;
          }
          if (j === 2){
            x_left += (bar_width/sets.length) + 1;
          }
          ctx.fillRect(x_left, p.canvasy,
              ((bar_width/sets.length)), y_bottom - p.canvasy);

          ctx.strokeRect(x_left, p.canvasy,
              ((bar_width/sets.length)), y_bottom - p.canvasy);
        }
      }
    }