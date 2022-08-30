// Original function was taken from https://dygraphs.com/tests/plotters.html
export const barChartPlotter = (e: any) => {
  const ctx = e.drawingContext;
  const points = e.points;
  const y_bottom = e.dygraph.toDomYCoord(0);

  ctx.fillStyle = e.color;

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
