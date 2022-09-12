import React from "react";
import { SliderIcon } from "./icon-slider-vertical";
import { Point2D } from "./overlay-bar-graph";

interface IProps {
  width: number,
  height: number,
  points: Array<Point2D>,
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const SliderIcons = (props: IProps) => {
  const {width, height, points, onMouseMove, onMouseDown, onMouseUp} = props;
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
            style={{position:"absolute", top: p.y - 20, left: p.x - 45.25}}>
            <SliderIcon/>
          </div>
        )
      })}
    </div>
  )
}