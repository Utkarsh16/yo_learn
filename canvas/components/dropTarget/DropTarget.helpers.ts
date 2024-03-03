import { DROP_DIRECTION, PLACEHOLDER_NODES } from '../../Canvas.enums';
import type { CanvasGraph, NodePositionMap } from '../../Canvas.types';
import {
  getNodeDimensions,
  getType,
  isActualNode,
  isOnceAllCompletedNode,
} from '../../helpers/generalHelpers';

/**
 * Constants ------------------------------------------------------------------>
 */

const PADDING = 20;
const SHADOW_WIDTH = 20;
const SHADOW_HEIGHT = 20;

/**
 * Functions ------------------------------------------------------------------>
 */

const getDropTargetPositionOnActualNode = (options: {
  dropTarget: {
    dropDirection: DROP_DIRECTION;
    dropTargetId: string;
  } | null;
  nodePositions: NodePositionMap;
  nodes: CanvasGraph;
}) => {
  const { dropTarget, nodePositions, nodes } = options;

  if (!dropTarget) return null;

  const nodeDimensions = getNodeDimensions(
    getType(nodes, dropTarget.dropTargetId)
  );

  const { dropDirection, dropTargetId } = dropTarget;
  const dropTargetPosition = nodePositions[dropTargetId];
  if (!dropTargetPosition) {
    return null;
  }
  const xDelta = nodeDimensions.width / 2 + PADDING;
  const yDelta = nodeDimensions.height / 2 + PADDING;

  switch (dropDirection) {
    case DROP_DIRECTION.LEFT:
      return {
        x: dropTargetPosition.x - xDelta,
        y: dropTargetPosition.y,
        w: SHADOW_WIDTH,
        h: nodeDimensions.height,
      };
    case DROP_DIRECTION.RIGHT:
      return {
        x: dropTargetPosition.x + xDelta,
        y: dropTargetPosition.y,
        w: SHADOW_WIDTH,
        h: nodeDimensions.height,
      };
    case DROP_DIRECTION.TOP:
      return {
        x: dropTargetPosition.x,
        y: dropTargetPosition.y - yDelta,
        w: nodeDimensions.width,
        h: SHADOW_HEIGHT,
      };
    case DROP_DIRECTION.BOTTOM:
      return {
        x: dropTargetPosition.x,
        y: dropTargetPosition.y + yDelta,
        w: nodeDimensions.width,
        h: SHADOW_HEIGHT,
      };
    default:
      return null;
  }
};

const getDropTargetPositionOnEmptyPlaceholderNode = (options: {
  dropTarget: {
    dropDirection: DROP_DIRECTION;
    dropTargetId: string;
  } | null;
  nodePositions: NodePositionMap;
  nodes: CanvasGraph;
}) => {
  const { dropTarget, nodePositions, nodes } = options;

  if (!dropTarget) return null;

  const dropTargetId = dropTarget.dropTargetId;

  const nodeDimensions = getNodeDimensions(getType(nodes, dropTargetId));

  const dropTargetPosition = nodePositions[dropTargetId];
  if (!dropTargetPosition) {
    return null;
  }
  return {
    x: dropTargetPosition.x,
    y: dropTargetPosition.y,
    w: nodeDimensions.width,
    h: nodeDimensions.height,
  };
};

const getDropTargetPositionOnDropPlaceholderNode = (options: {
  dropTarget: {
    dropDirection: DROP_DIRECTION;
    dropTargetId: string;
  } | null;
  nodePositions: NodePositionMap;
  nodes: CanvasGraph;
}) => {
  const { dropTarget, nodePositions, nodes } = options;

  if (!dropTarget) return null;

  const dropTargetId = dropTarget.dropTargetId;

  const nodeDimensions = getNodeDimensions(getType(nodes, dropTargetId));

  const dropTargetPosition = nodePositions[dropTargetId];
  if (!dropTargetPosition) {
    return null;
  }
  return {
    x: dropTargetPosition.x,
    y: dropTargetPosition.y,
    w: nodeDimensions.width,
    h: nodeDimensions.height / 2,
  };
};

const getDropTargetPositionOnOnceAllCompletedNode = (options: {
  dropTarget: {
    dropDirection: DROP_DIRECTION;
    dropTargetId: string;
  } | null;
  nodePositions: NodePositionMap;
  nodes: CanvasGraph;
}) => {
  const { dropTarget, nodePositions, nodes } = options;

  if (!dropTarget) return null;

  const dropTargetId = dropTarget.dropTargetId;

  const nodeDimensions = getNodeDimensions(getType(nodes, dropTargetId));

  const dropTargetPosition = nodePositions[dropTargetId];
  if (!dropTargetPosition) {
    return null;
  }

  return {
    x: dropTargetPosition.x,
    y: dropTargetPosition.y,
    w: nodeDimensions.width,
    h: nodeDimensions.height / 2,
  };
};

export const getDropTargetPosition = (options: {
  dropTarget: {
    dropDirection: DROP_DIRECTION;
    dropTargetId: string;
  } | null;
  nodePositions: NodePositionMap;
  nodes: CanvasGraph;
}) => {
  const { dropTarget, nodes } = options;

  if (!dropTarget) return null;

  const dropTargetType = getType(nodes, dropTarget.dropTargetId);

  switch (true) {
    case isActualNode(dropTargetType):
      return getDropTargetPositionOnActualNode(options);
    case dropTargetType === PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER:
      return getDropTargetPositionOnEmptyPlaceholderNode(options);
    case dropTargetType === PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER:
      return getDropTargetPositionOnDropPlaceholderNode(options);
    case isOnceAllCompletedNode(dropTargetType):
      return getDropTargetPositionOnOnceAllCompletedNode(options);
    default:
      return null;
  }
};
