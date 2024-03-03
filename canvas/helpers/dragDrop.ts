import { DROP_DIRECTION } from '../Canvas.enums';
import type { CanvasGraph, Node, NodePositionMap } from '../Canvas.types';
import type { CanvasStore } from '../stores/useCanvasStore.types';
import { getType, isIfElseNode, isPlaceholderNode } from './generalHelpers';

const canDropInParallel = (
  draggedNode: Node,
  closestNode: Node,
  blockBranchNodes: string[],
  enableParallelDropZones: boolean
) => {
  return enableParallelDropZones;

  // const draggedNodeType = draggedNode.type;
  // const closestNodeType = closestNode.type;

  // if (isABlock(draggedNodeType) || isABlock(closestNodeType)) return false;

  // const closestNodeIsBranchNode = blockBranchNodes.includes(
  //   closestNode.id as string
  // );
  // if (closestNodeIsBranchNode) return false;
};

/**
 * Util function to iterate through the node positions and find the closest one to the target coordinates
 * returns the closest node id and the drop direction wrt the closest node
 */
const findClosestNode = (options: {
  nodes: CanvasGraph;
  nodePositions: NodePositionMap;
  targetCoordinates: { x: number; y: number };
  draggedNode: Node;
  blockBranchNodes: string[];
  enableParallelDropZones: boolean;
}) => {
  const {
    nodes,
    nodePositions,
    targetCoordinates,
    draggedNode,
    blockBranchNodes,
    enableParallelDropZones = false,
  } = options;

  const MIN_DROP_DISTANCE = 200;

  const { x, y } = targetCoordinates;

  let closestNodeId = '';
  let closestDistance = MIN_DROP_DISTANCE;
  let direction: DROP_DIRECTION | null = null;

  // Iterate through the elements and calculate the distance for each one
  Object.keys(nodePositions).forEach(nodeId => {
    const position = nodePositions[nodeId];
    if (!position) {
      return;
    }
    const deltaXToNode = x - position.x;
    const deltaYToNode = y - position.y;

    const distance = Math.sqrt(deltaXToNode ** 2 + deltaYToNode ** 2);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestNodeId = nodeId;

      // Calculate the direction based on the angle
      const angle = Math.atan2(deltaYToNode, deltaXToNode) * (180 / Math.PI); // Convert radians to degree
      const shouldAllowDropOnTop = true;
      const shouldAllowDropOnBottom = !isIfElseNode(
        getType(nodes, closestNodeId)
      );
      const shouldAllowDropInParallel = canDropInParallel(
        draggedNode,
        nodes.nodes[closestNodeId],
        blockBranchNodes,
        enableParallelDropZones
      );

      /**
       * Following angles are calculated depending on the size of the DEFAULT node type,
       * since they are rectangles, they are not exactly multiples of 45 deg
       */
      if (shouldAllowDropInParallel && angle > -20 && angle <= 20) {
        direction = DROP_DIRECTION.RIGHT;
      } else if (shouldAllowDropOnBottom && angle > 20 && angle <= 160) {
        direction = DROP_DIRECTION.BOTTOM;
      } else if (shouldAllowDropInParallel && (angle > 160 || angle <= -160)) {
        direction = DROP_DIRECTION.LEFT;
      } else if (shouldAllowDropOnTop) {
        direction = DROP_DIRECTION.TOP;
      }
    }
  });

  return closestNodeId
    ? { closestNodeId, direction: direction as unknown as DROP_DIRECTION }
    : null;
};

/**
 * Util function to find the drop target for the dragged node
 */
export const getDropTarget = (
  drag: CanvasStore['drag'],
  nodesInfo: CanvasStore['nodesInfo'],
  enableParallelDropZones = false,
  newNode?: Node & Required<Pick<Node, 'id'>>
) => {
  const { nodePositions, rootNode, nodesClone, allNodeIds, blockBranchNodes } =
    nodesInfo;

  if (!drag || !drag.moved) return null;

  const dragX = drag.x + drag.offsetX;
  const dragY = drag.y + drag.offsetY;
  const draggedNodeId = newNode ? newNode.id : drag.nodeId;

  const dropTarget = findClosestNode({
    nodePositions,
    blockBranchNodes,
    enableParallelDropZones,
    nodes: nodesClone,
    draggedNode: newNode || nodesClone.nodes[draggedNodeId],
    targetCoordinates: { x: dragX, y: dragY },
  });
  if (!dropTarget) return null;

  const { closestNodeId, direction: dropDirection } = dropTarget;

  /**
   * 1. If the dropTarget is the dragged node itself, don't allow drop
   * 2. If the dropTarget is the root node -
   *    a. allow drop only if its child is not the placeholder node
   *    b. allow drop only at the BOTTOM
   * 3. If the dropTarget is an IF_ELSE node, do not allow drop at the BOTTOM
   */

  // 1.
  const isDroppedOnSelf = closestNodeId === draggedNodeId;

  // 2.
  let shouldNotDropOnRoot = false;
  if (closestNodeId === rootNode) {
    const isPlaceholderNodeChild =
      allNodeIds.length === 2 &&
      isPlaceholderNode(getType(nodesClone, allNodeIds[1]));

    if (isPlaceholderNodeChild || dropDirection !== DROP_DIRECTION.BOTTOM) {
      shouldNotDropOnRoot = true;
    }
  }

  // 3.
  const isIfElseNodeClosest = isIfElseNode(getType(nodesClone, closestNodeId));
  const shouldNotDropOnIfElseNode =
    isIfElseNodeClosest && dropDirection === DROP_DIRECTION.BOTTOM;

  if (isDroppedOnSelf || shouldNotDropOnRoot || shouldNotDropOnIfElseNode) {
    return null;
  }

  return { dropDirection, dropTargetId: closestNodeId };
};
