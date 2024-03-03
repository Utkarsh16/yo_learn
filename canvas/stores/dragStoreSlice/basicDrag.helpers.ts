import { DROP_DIRECTION } from '../../Canvas.enums';
import {
  getType,
  isABlock,
  isActualNode,
  isOnceAllCompletedNode,
} from '../../helpers/generalHelpers';
import {
  insertChildrenAtIndex,
  removeChildFromNode,
  setNodeChildren,
} from '../../helpers/nodeChildren';
import {
  buildParentMap,
  directNodeChildren,
} from '../../helpers/nodeNavigation';
import { sanitizeBlocksAndNodes } from '../../helpers/nodeProcessors';
import type { DropOptions } from './dragStoreSlice.types';
import { insertAfter, insertBefore, removeFromParent } from './nodes.helpers';

const performBasicDropOnActualNode = (options: DropOptions) => {
  const {
    nodes,
    sourceNodeId,
    targetNodeId,
    dropDirection,
    // nodesInfo,
    newNode,
  } = options;
  // const { childToParentMap } = nodesInfo;
  const childToParentMap = buildParentMap(nodes);

  const sourceParent: string = childToParentMap[sourceNodeId]?.[0];
  const targetParent: string = childToParentMap[targetNodeId]?.[0];

  const isSourceABlock = isABlock(getType(nodes, sourceNodeId));

  const sourceParentChildren = directNodeChildren(nodes, sourceParent);
  const targetParentChildren = directNodeChildren(nodes, targetParent);

  const removeSourceFromPreviousParent = () => {
    const sourceNodeIndex = sourceParentChildren.indexOf(sourceNodeId);
    removeChildFromNode(nodes, sourceParent, sourceNodeId);
    return sourceNodeIndex;
  };

  const moveSourceChildrenToPreviousParent = (sourceNodeIndex: number) => {
    let sourceChildren = directNodeChildren(nodes, sourceNodeId);
    sourceChildren = sourceChildren.filter(
      childId => !childId || !isOnceAllCompletedNode(getType(nodes, childId))
    );
    insertChildrenAtIndex(nodes, {
      nodeId: sourceParent,
      childNodeIds: sourceChildren,
      insertAtIndex: sourceNodeIndex,
      replace: false,
    });
  };

  switch (dropDirection) {
    case DROP_DIRECTION.LEFT:
    case DROP_DIRECTION.RIGHT: {
      // Do not drop if a block is dropped to the left or right of a node
      if (isSourceABlock) break;

      let sourceNodeIndex = -1;
      if (!newNode) {
        // remove from previous parent
        sourceNodeIndex = removeSourceFromPreviousParent();
      }

      // add to new parent
      let targetNodeIndex = targetParentChildren.indexOf(targetNodeId);
      targetNodeIndex =
        dropDirection === DROP_DIRECTION.RIGHT
          ? targetNodeIndex + 1
          : targetNodeIndex;
      insertChildrenAtIndex(nodes, {
        nodeId: targetParent,
        insertAtIndex: targetNodeIndex,
        replace: false,
        childNodeIds: [sourceNodeId],
      });

      if (!newNode) {
        moveSourceChildrenToPreviousParent(sourceNodeIndex);
        // Empty the source node's children
        setNodeChildren(nodes, {
          nodeId: sourceNodeId,
          childNodes: [],
        });
      }
      break;
    }
    case DROP_DIRECTION.TOP: {
      // dragging a node on the top of its next node is a noop
      if (targetParent === sourceNodeId) {
        break;
      }
      removeFromParent(nodes, childToParentMap, sourceNodeId);
      insertBefore(nodes, childToParentMap, targetNodeId, sourceNodeId);
      break;
    }
    case DROP_DIRECTION.BOTTOM: {
      // dragging a node on the bottom of its parent node is a noop
      if (sourceParent === targetNodeId) {
        break;
      }
      removeFromParent(nodes, childToParentMap, sourceNodeId);
      insertAfter(nodes, targetNodeId, sourceNodeId);
      break;
    }
    default:
      break;
  }

  return sanitizeBlocksAndNodes(nodes);
};

const performBasicDropOnOnceAllCompletedNode = ({
  nodes,
  sourceNodeId,
  targetNodeId,
}: DropOptions) => {
  // const { childToParentMap } = nodesInfo;
  const childToParentMap = buildParentMap(nodes);

  // remove from prev parent
  removeFromParent(nodes, childToParentMap, sourceNodeId);
  insertAfter(nodes, targetNodeId, sourceNodeId);

  return sanitizeBlocksAndNodes(nodes);
};

const performBlockDropOnOnceAllCompletedNode = (options: DropOptions) => {
  console.log('performBlockDropOnOnceAllCompletedNode');
  const { nodes } = options;
  return sanitizeBlocksAndNodes(nodes);
};

export const performDropOnBasicNodes = (options: DropOptions) => {
  const { nodes, targetNodeId, sourceNodeId } = options;
  const targetNodeType = getType(nodes, targetNodeId);
  const sourceNodeType = getType(nodes, sourceNodeId);

  switch (true) {
    case isActualNode(targetNodeType):
      return performBasicDropOnActualNode(options);
    case isOnceAllCompletedNode(targetNodeType):
      return isABlock(sourceNodeType)
        ? performBlockDropOnOnceAllCompletedNode(options)
        : performBasicDropOnOnceAllCompletedNode(options);
    default:
      return { nodes };
  }
};
