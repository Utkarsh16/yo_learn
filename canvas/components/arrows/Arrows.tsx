/* eslint-disable rippling-eslint/no-hard-coded-strings */
import React from 'react';
import { Typography } from '@rippling/ui';
import { Colors, Fonts } from '@rippling/ui/Constants';
import { CANVAS_TRANSLATION_KEYS, NODE_SPACING } from '../../Canvas.constants';
import type { NodeDimensions, NodePosition } from '../../Canvas.types';
import { translateCanvasString } from '../../helpers/translations';
import { EndTextContainer } from './Arrows.styles';

/**
 * Renders an angled downward arrow between two points, like this:
 *
 * Default arrow -
 *    |
 *    |
 *    |
 *    |----------|
 *               |
 *               |
 *               v
 *
 * isLShapedDiverging -
 *
 *     ----------|
 *               |
 *               |
 *               v
 *
 *  isLShapedConverging -
 *
 *               |
 *               |
 *               |
 *     <----------
 */

type ArrowProps = {
  id: string;
  fromPosition: NodePosition;
  toPosition: NodePosition;
  // TODO: jrdrg - leaving this prop in even though it's now unused in case we need it later when we add logic blocks etc
  // eslint-disable-next-line
  nodeDimensions: NodeDimensions;
  isEndArrow?: boolean;
  isLShapedDiverging?: boolean;
  isLShapedConverging?: boolean;
  hideArrowMarker?: boolean;
  text?: string;
};

const Arrow = (props: ArrowProps) => {
  const NODE_ARROW_PADDING_IN_PX = 10;

  const {
    id,
    fromPosition,
    isLShapedDiverging,
    isLShapedConverging,
    isEndArrow,
    hideArrowMarker,
    text,
  } = props;
  let toPosition = props.toPosition;

  // Start from end node
  if (isEndArrow) {
    toPosition = {
      ...toPosition,
      y: toPosition.y + NODE_SPACING.vertical,
    };
  }

  const { x: fromX, y: fromY } = fromPosition;
  const { x: toX, y: toY } = toPosition;

  const boundingBox = {
    x: Math.min(fromX, toX),
    y: Math.min(fromY, toY),
    width: Math.abs(fromX - toX),
    height: Math.abs(fromY - toY),
  };

  const BUFFER = 20;
  const arrowFromX = fromX + BUFFER - boundingBox.x;
  const arrowFromY = fromY + BUFFER - boundingBox.y;
  const arrowToX = toX + BUFFER - boundingBox.x;
  const arrowToY = toY + BUFFER - boundingBox.y;

  const midY = (arrowFromY + arrowToY) / 2;

  const startPoint = `M ${arrowFromX} ${arrowFromY}`;
  const endPoint = `L ${arrowToX} ${arrowToY}`;

  const firstMid = isLShapedDiverging
    ? ''
    : `L ${arrowFromX} ${isLShapedConverging ? arrowToY : midY}`;
  const secondMid = isLShapedConverging
    ? ''
    : `L ${arrowToX} ${isLShapedDiverging ? arrowFromY : midY}`;

  const markerId = `arrowhead_${id}`;
  const markerTextId = `markerText_${id}`;

  const renderMarker = () => {
    return (
      <defs>
        {hideArrowMarker ? (
          <></>
        ) : (
          <marker
            id={markerId}
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
            fill={Colors.GRAY4}
          >
            <polygon points="0 0, 7 3.5, 0 7" />
          </marker>
        )}
      </defs>
    );
  };

  const renderText = () => {
    return (
      <>
        {text ? (
          <g transform={`translate(${arrowToX - 20}, ${arrowToY - 40})`}>
            <rect
              width="40"
              height="16"
              fill="#ffffff"
              stroke="#595555"
              strokeWidth="1"
              rx="2"
            />
            <text
              id={markerTextId}
              x="20"
              y="12"
              textAnchor="middle"
              fill="#595555"
              fontSize="12"
            >
              {text}
            </text>
          </g>
        ) : (
          <></>
        )}
      </>
    );
  };

  const renderPath = () => {
    return (
      <>
        <path
          d={`${startPoint} ${firstMid} ${secondMid} ${endPoint}`}
          stroke={Colors.GRAY4}
          strokeWidth={1}
          fill="none"
          // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
          markerEnd={hideArrowMarker ? undefined : `url(#${markerId})`}
          strokeDasharray="3,3"
        />
      </>
    );
  };

  const renderEndText = () => {
    return (
      <>
        {isEndArrow && (
          <EndTextContainer x={toX} y={toY + NODE_ARROW_PADDING_IN_PX}>
            <Typography.Body1
              color={Colors.GRAY4}
              fontFamily={Fonts.RIPPLING_FONT_MEDIUM}
            >
              {translateCanvasString(CANVAS_TRANSLATION_KEYS.END)}
            </Typography.Body1>
          </EndTextContainer>
        )}
      </>
    );
  };

  return (
    <>
      <svg
        id={id}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: boundingBox.x - BUFFER,
          top: boundingBox.y - BUFFER,
          width: boundingBox.width + BUFFER * 2,
          height: boundingBox.height + BUFFER * 2,
        }}
      >
        {renderPath()}
        {renderMarker()}
        {renderText()}
      </svg>
      {renderEndText()}
    </>
  );
};

export default Arrow;
