/* eslint-disable rippling-eslint/no-hard-coded-strings */
import React from 'react';
import { Colors } from '@rippling/ui/Constants';
import type { NodeDimensions, NodePosition } from '../../Canvas.types';

/**
 * Renders an Loop arrow between two points, like this:
 *
 * Default arrow -
 *    |------------|
 *                 |
 *                 |
 *                 |
 *    <------------|
 *
 */

type ArrowProps = {
  id: string;
  fromPosition: NodePosition;
  toPosition: NodePosition;
  nodeDimensions: NodeDimensions;
  loopWidth: number;
};

const LoopArrow = (props: ArrowProps) => {
  const { id, fromPosition, toPosition, nodeDimensions, loopWidth } = props;

  let { x: fromX, y: fromY } = fromPosition;
  let { x: toX, y: toY } = toPosition;

  const boundingBox = {
    x: Math.min(fromX, toX) - loopWidth,
    y: Math.min(fromY, toY),
    width: Math.abs(fromX - toX + loopWidth),
    height: Math.abs(fromY - toY),
  };

  const BUFFER = 20;
  fromX += BUFFER - boundingBox.x;
  fromY += BUFFER - boundingBox.y;
  toX += BUFFER - boundingBox.x;
  toY += BUFFER - boundingBox.y;

  const markerId = `arrowhead_${id}`;
  return (
    <>
      <svg
        key={id}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: boundingBox.x - BUFFER,
          top: boundingBox.y - BUFFER,
          width: boundingBox.width + BUFFER * 2,
          height: boundingBox.height + BUFFER * 2,
        }}
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
            fill={Colors.GRAY4}
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>
        <path
          d={`M ${fromX} ${fromY} L ${fromX - loopWidth} ${fromY} L ${
            fromX - loopWidth
          } ${toY} L ${toX - nodeDimensions.width / 2} ${toY}`}
          stroke={Colors.GRAY4}
          strokeWidth={1}
          fill="none"
          // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
          markerEnd={`url(#${markerId})`}
          strokeDasharray="3,3"
        />
      </svg>
    </>
  );
};

export default LoopArrow;
