import * as React from "react";
import Dygraph from "dygraphs";

interface Point2D {
    x: number;
    y: number;
}

export interface PredictionGraphProps {
    width: number;
    height: number;
    parentGraph?: Dygraph;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    show: boolean;
    enableEdit: boolean;
}

export interface PredictionGraphState {
  points: Point2D[];
  selected: Point2D | null;
  active: Point2D | null;
}

// Zeplin specs:  https://zpl.io/09kdQlE
const PREDICTION_LINE_COLOR = "#ff8415";
const ACTIVE_POINT_COLOR = "#0081ff";


export class PredictionGraph extends React.Component<PredictionGraphProps, PredictionGraphState> {
    canvasRef: HTMLCanvasElement|null;

    constructor(props: PredictionGraphProps) {
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
      this.updateCanvas();
    }
    // componentDidUpdate() {
    //   this.updateCanvas();
    // }
    componentDidUpdate(prevProps: PredictionGraphProps) {
      if(prevProps.enableEdit !== this.props.enableEdit) {
        this.setState({active: null, selected: null});
      }
      this.updateCanvas();
    }
    drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number) {
      const rad = 5;
      if(ctx) {
        ctx.beginPath();
        ctx.ellipse(x, y, rad, rad, 0, 0, Math.PI * 2);
        ctx.fill();
      }
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
      if(this.canvasRef) {
        const ctx = this.canvasRef.getContext('2d');
        let lastPoint: Point2D | null = null;
        if(ctx) {
          for(let i = 0; i < points.length; i++) {
            const point = points[i];

            if(lastPoint) {
              ctx.strokeStyle = PREDICTION_LINE_COLOR;
              ctx.lineWidth = 2;
              ctx.fillStyle = "none";
              ctx.beginPath();
              ctx.moveTo(lastPoint.x, lastPoint.y);
              ctx.lineTo(point.x, point.y);
              ctx.stroke();
            }
            if(selected === point) {
              ctx.fillStyle = ACTIVE_POINT_COLOR;
            } else {
              ctx.fillStyle = PREDICTION_LINE_COLOR;
            }
            this.drawPoint(ctx, point.x, point.y);
            lastPoint = point;
          }
        }
      }
    }

    pointInRange(point: Point2D) {
      const { minX, maxX, minY, maxY, parentGraph } = this.props;
      if(parentGraph) {
        const dataPoints = parentGraph.toDataCoords(point.x, point.y);
        const x = dataPoints[0];
        const y = dataPoints[0];
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      }
      return false;
    }


    findNearPoint(x: number, y: number, nearDistance: number) {
      const { points } = this.state;
      for(let i = 0; i < points.length; i++) {
        const point = points[i];
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        if(distance < nearDistance) {
          return point;
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

    handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { enableEdit } = this.props;
      if(!enableEdit) { return; }
      const { points } = this.state;

      if(this.canvasRef) {
        const {x, y} = this.toCanvasCoords(e);
        const point = this.findNearPoint(x, y, 10);
        if(point) {
          this.setState({selected: point, active: point});
        } else {
          if(this.pointInRange({x, y})) {
            const newPoint = {x, y};
            points.push(newPoint);
            this.setState(
              {
                points: [...points.sort((a, b) => a.x - b.x)],
                selected: newPoint,
                active: newPoint
              });
          }
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
            active.x = x;
            active.y = y;
            this.setState({points: [...this.state.points]});
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
            zIndex: 10,
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
