import * as React from "react";
import Dygraph from "dygraphs";

interface Point2D {
    x: number;
    y: number;
}

export interface OverlayGraphProps {
    width: number;
    height: number;
    parentGraph?: Dygraph;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    show: boolean;
    enableEdit: boolean;
    setDataF: (data: number[][]) => void;
    data: number[][];
    color: string;
}

export interface OverlayGraphState {
  points: Point2D[];
  selected: Point2D | null;
  active: Point2D | null;
}

// Zeplin specs:  https://zpl.io/09kdQlE
const DEFAULT_LINE_COLOR = "#ff8415";
const ACTIVE_POINT_COLOR = "#0081ff";

const dataToPoints = (data: number[][]) => {
    return data.map((point) => {
        return {  x: point[0], y: point[1] };
    });
};

const pointsToData = (points: Point2D[]) => {
    return points.map((point) => {
        return [point.x, point.y];
    });
};

export class OverlayGraph extends React.Component<OverlayGraphProps, OverlayGraphState> {
    canvasRef: HTMLCanvasElement|null;
    updateTimeout: number | null = null;
    constructor(props: OverlayGraphProps) {
        super(props);
        this.canvasRef = null;
        this.state = {
            points: [],
            selected: null,
            active: null
        };
    }

    setCanvasRef(canvas: HTMLCanvasElement) {
      if(canvas) {
        this.canvasRef = canvas;
      }
    }

    componentDidMount() {
      this.setState({points: dataToPoints(this.props.data)});
      this.updateCanvas();
    }

    componentDidUpdate(prevProps: OverlayGraphProps) {
      const { data, minX, minY, maxX, maxY } = this.props;
      if(prevProps.enableEdit !== this.props.enableEdit) {
        this.setState({active: null, selected: null});
      }
      if(
        prevProps.minX!== minX ||
        prevProps.maxX!== maxX ||
        prevProps.minY!== minY ||
        prevProps.maxY!== maxY
        ) {
        this.setState({points: dataToPoints(data)});
      }
      if (!data.length && prevProps.data.length){
        this.clearState();
      }
      this.updateCanvas();
    }

    clearState(){
      this.setState({points: [], selected: null, active: null})
    }

    drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number) {
      const rad = 5;
      if(ctx) {
        ctx.beginPath();
        ctx.ellipse(x, y, rad, rad, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    toCanvasPoint(dataPoint: Point2D) {
      const { parentGraph } = this.props;
      if(parentGraph) {
        return {
          x: parentGraph.toDomXCoord(dataPoint.x),
          y: parentGraph.toDomYCoord(dataPoint.y)
        };
      }
      // Assume that there is not transform required
      return { ...dataPoint };
    }

    toDataPoint(canvasPoint: Point2D) {
      const { parentGraph } = this.props;
      if(parentGraph) {
        return {
          x: parentGraph.toDataXCoord(canvasPoint.x),
          y: parentGraph.toDataYCoord(canvasPoint.y)
        };
      }
      // Assume that there is not transform required
      return { ...canvasPoint };
    }

    clear() {
      if(this.canvasRef) {
        const ctx = this.canvasRef.getContext("2d");
        if(ctx) {
          ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
        }
      }
    }

    updateCanvas() {
      this.clear();
      const { points, selected } = this.state;
      const { color, minX } = this.props;
      if(this.canvasRef) {
        const ctx = this.canvasRef.getContext('2d');
        let lastCanvasPoint: Point2D | null = null;
        if(ctx) {
          for(let i = 0; i < points.length; i++) {
            const canvasPoint = this.toCanvasPoint(points[i]);
            if (points[i].x > minX) {
              if(lastCanvasPoint) {
                ctx.strokeStyle = color || DEFAULT_LINE_COLOR;
                ctx.lineWidth = 2;
                ctx.fillStyle = "none";
                ctx.beginPath();
                ctx.moveTo(lastCanvasPoint.x, lastCanvasPoint.y);
                ctx.lineTo(canvasPoint.x, canvasPoint.y);
                ctx.stroke();
              }
              if(selected === points[i]) {
                ctx.fillStyle = ACTIVE_POINT_COLOR;
              } else {
                ctx.fillStyle = color || DEFAULT_LINE_COLOR;
              }
              this.drawPoint(ctx, canvasPoint.x, canvasPoint.y);
              lastCanvasPoint = canvasPoint;
            }
            else {
              lastCanvasPoint = this.toCanvasPoint({x: minX, y: points[i].y});
            }
          }
        }
      }
    }

    // Use the point value, not canvas location
    pointInRange(canvasPoint: Point2D) {
      const { minX, maxX, minY, maxY } = this.props;
      const dataPoint = this.toDataPoint(canvasPoint);
      const {x, y} = dataPoint;
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }


    findNearPoint(x: number, y: number, nearDistance: number) {
      const { points } = this.state;
      for(let i = 0; i < points.length; i++) {
        const canvasPoint = this.toCanvasPoint(points[i]);
        const distance = Math.sqrt(Math.pow(canvasPoint.x - x, 2) + Math.pow(canvasPoint.y - y, 2));
        if(distance < nearDistance) {
          return points[i];
        }
      }
      return null;
    }

    toCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
      const { clientX, clientY } = e;
      if(this.canvasRef) {
        const rect = this.canvasRef.getBoundingClientRect();
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      }
      return { x: 0, y: 0 };

    }

    updatePoints(changes:{selected?: Point2D, active?: Point2D}) {
      const { points, active, selected } = this.state;
      const { setDataF } = this.props;
      const nextPoints = points.sort((a, b) => a.x - b.x);
      this.setState({
        points: nextPoints,
        active: changes.active === undefined ? active : changes.active,
        selected: changes.selected === undefined ? selected : changes.selected
      });
      setDataF(pointsToData(points));
    }

    addPoint(x: number, y: number) {
      if(this.pointInRange({x, y})) {
        const { points } = this.state;
        const { parentGraph } = this.props;
        const dataPoint = parentGraph
          ? parentGraph.toDataCoords(x, y)
          : [x, y];
        const newPoint = {x: dataPoint[0], y: dataPoint[1]};
        points.push(newPoint);
        this.updatePoints({selected: newPoint, active: newPoint});
      }
    }

    handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { enableEdit } = this.props;
      if(!enableEdit) { return; }
      if(this.canvasRef) {
        const {x, y} = this.toCanvasCoords(e);
        const point = this.findNearPoint(x, y, 10);
        if(point) {
          this.setState({selected: point, active: point});
        } else {
          this.addPoint(x, y);
        }
      }
    }

    handleMouseDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { enableEdit } = this.props;
      if(!enableEdit) { return; }
      const { active } = this.state;

      if(active) {
        if(this.canvasRef) {
          const {x, y} = this.toCanvasCoords(e);
          if(this.pointInRange({x, y})) {
            const {x: dataX, y: dataY} = this.toDataPoint({x, y});
            active.x = dataX;
            active.y = dataY;
            this.updatePoints({active});
          }
        }
      }
    }

    handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      const { enableEdit } = this.props;
      if(!enableEdit) { return; }
      const { selected } = this.state;
      if(selected) {
        if(e.key === "Backspace") {
          const { points } = this.state;
          const newPoints = points.filter(point => point !== selected);
          this.setState({
            points: newPoints,
            selected: null,
            active: null
          });
        }
      }
    }

    handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { enableEdit } = this.props;
      if(!enableEdit) { return; }
      this.setState({active: null});
    }

    render() {
        const { width, height, show, enableEdit } = this.props;
        const canvasStyle: React.CSSProperties = {
            position: "absolute",
            top: "0px",
            left: "0px",
            width: width + "px",
            height: height + "px",
            zIndex: 1,
            pointerEvents: enableEdit ? "auto" : "none"
        };
        return (
          show &&
            <div onKeyUp={this.handleKeyDown} tabIndex={0}>
              <canvas
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseDrag}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseUp}
                width={width}
                height={height}
                style={canvasStyle}
                ref={(r) => this.setCanvasRef(r!)} />
            </div>
        );
    }
}
