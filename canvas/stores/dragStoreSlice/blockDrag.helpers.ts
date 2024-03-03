import { DROP_DIRECTION, NODE_TYPES } from '../../Canvas.enums';
import { getType, isABlock } from '../../helpers/generalHelpers';
import {
  buildParentMap,
  directNodeChildren,
  getBlockChildren,
} from '../../helpers/nodeNavigation';
import { sanitizeBlocksAndNodes } from '../../helpers/nodeProcessors';
import type { DropOptions } from './dragStoreSlice.types';
import { insertBefore, removeFromParent } from './nodes.helpers';

const performDropOfBasicOnForNode = (options: DropOptions) => {
  const { nodes, sourceNodeId, targetNodeId, dropDirection, newNode } = options;

  const childToParentMap = buildParentMap(nodes);

  const sourceParent: string = childToParentMap[sourceNodeId]?.[0];
  const targetParent: string = childToParentMap[targetNodeId]?.[0];

  switch (dropDirection) {
    case DROP_DIRECTION.TOP: {
      if (targetParent === sourceNodeId) break;

      removeFromParent(nodes, childToParentMap, sourceNodeId);
      insertBefore(nodes, childToParentMap, targetNodeId, sourceNodeId);
      break;
    }
    case DROP_DIRECTION.BOTTOM: {
      // If the target is source's parent, then do nothing
      if (!newNode && sourceParent === targetNodeId) break;

      const targetNode = nodes.nodes[targetNodeId];
      if (targetNode.type === NODE_TYPES.FOR_EACH) {
        removeFromParent(nodes, childToParentMap, sourceNodeId);
        if (targetNode.body) {
          insertBefore(nodes, childToParentMap, targetNode.body, sourceNodeId);
        } else {
          targetNode.body = sourceNodeId;
        }
      }
      break;
    }
    default:
      break;
  }

  return sanitizeBlocksAndNodes(nodes);
};

const performDropOfBlockOnForNode = (options: DropOptions) => {
  const { nodes, sourceNodeId, targetNodeId, dropDirection, newNode } = options;
  const childToParentMap = buildParentMap(nodes);

  const sourceParent: string = childToParentMap[sourceNodeId]?.[0];

  switch (dropDirection) {
    case DROP_DIRECTION.TOP: {
      const firstBlockChild = getBlockChildren(nodes, sourceNodeId)?.[0];
      const firstBlockNodeChild = firstBlockChild
        ? directNodeChildren(nodes, firstBlockChild)?.[0]
        : null;
      if (!newNode && firstBlockNodeChild === targetNodeId) {
        break;
      }

      removeFromParent(nodes, childToParentMap, sourceNodeId);
      insertBefore(nodes, childToParentMap, targetNodeId, sourceNodeId);

      break;
    }
    case DROP_DIRECTION.BOTTOM: {
      // If the target is source's parent, then do nothing
      if (!newNode && sourceParent === targetNodeId) break;

      const targetNode = nodes.nodes[targetNodeId];
      if (targetNode.type === NODE_TYPES.FOR_EACH) {
        removeFromParent(nodes, childToParentMap, sourceNodeId);
        if (targetNode.body) {
          insertBefore(nodes, childToParentMap, targetNode.body, sourceNodeId);
        } else {
          targetNode.body = sourceNodeId;
        }
      }
      break;
    }
    default:
      break;
  }

  return sanitizeBlocksAndNodes(nodes);
};

const performDropOfBasicOnIfElseNode = (options: DropOptions) => {
  const { nodes, sourceNodeId, targetNodeId, dropDirection } = options;
  const childToParentMap = buildParentMap(nodes);

  const targetParent: string = childToParentMap[targetNodeId]?.[0];

  switch (dropDirection) {
    case DROP_DIRECTION.TOP: {
      if (targetParent === sourceNodeId) break;

      removeFromParent(nodes, childToParentMap, sourceNodeId);
      insertBefore(nodes, childToParentMap, targetNodeId, sourceNodeId);

      break;
    }
    default:
      break;
  }

  return sanitizeBlocksAndNodes(nodes);
};

const performDropOfBlockOnIfElseNode = (options: DropOptions) => {
  const { nodes, sourceNodeId, targetNodeId, dropDirection } = options;
  const childToParentMap = buildParentMap(nodes);

  const targetParent: string = childToParentMap[targetNodeId]?.[0];

  switch (dropDirection) {
    case DROP_DIRECTION.TOP: {
      if (targetParent === sourceNodeId) break;

      removeFromParent(nodes, childToParentMap, sourceNodeId);
      insertBefore(nodes, childToParentMap, targetNodeId, sourceNodeId);

      break;
    }
    default:
      break;
  }

  return sanitizeBlocksAndNodes(nodes);
};

export const performDropOnBlockNodes = (options: DropOptions) => {
  const { nodes, targetNodeId, sourceNodeId } = options;
  const targetNodeType = getType(nodes, targetNodeId);
  const sourceNodeType = getType(nodes, sourceNodeId);

  switch (targetNodeType) {
    case NODE_TYPES.FOR_EACH:
      return isABlock(sourceNodeType)
        ? performDropOfBlockOnForNode(options)
        : performDropOfBasicOnForNode(options);
    case NODE_TYPES.IF_ELSE:
    case NODE_TYPES.DO_IN_PARALLEL:
      return isABlock(sourceNodeType)
        ? performDropOfBlockOnIfElseNode(options)
        : performDropOfBasicOnIfElseNode(options);
    default:
      return { nodes };
  }
};
