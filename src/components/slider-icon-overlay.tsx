import React from "react";
import { SliderIcon } from "./icon-slider-vertical";
import { Point2D } from "./overlay-bar-graph";

interface IProps {
  width: number,
  height: number,
  points: Array<Point2D>,
  multiBarCount?: number;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const SliderIcons = (props: IProps) => {
  const {width, height, points, multiBarCount, onMouseMove, onMouseDown, onMouseUp} = props;
  const xOffset = multiBarCount && multiBarCount > 2 ? 0 : 30;

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{position:"absolute", top: 0, left: 0, width, height, zIndex: 2}}
    >
      {points.map((p, i) => {
        return (
          <div
            key={i}
            className={`slider-${i}`}
            style={{position:"absolute", top: p.y - 15, left: p.x - xOffset}}>
            <SliderIcon/>
          </div>
        )
      })}
    </div>
  )
}