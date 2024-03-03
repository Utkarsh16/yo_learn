import { PLACEHOLDER_NODES } from '../../Canvas.enums';
import { getType } from '../../helpers/generalHelpers';
import { setNodeChildren } from '../../helpers/nodeChildren';
import { buildParentMap } from '../../helpers/nodeNavigation';
import { sanitizeBlocksAndNodes } from '../../helpers/nodeProcessors';
import type { DropOptions } from './dragStoreSlice.types';
import { insertBefore, removeFromParent } from './nodes.helpers';

const performDropOnDropTargetPlaceholderNode = ({
  nodes,
  sourceNodeId,
  targetNodeId,
}: DropOptions) => {
  const childToParentMap = buildParentMap(nodes);

  removeFromParent(nodes, childToParentMap, sourceNodeId);

  insertBefore(nodes, childToParentMap, targetNodeId, sourceNodeId);
  removeFromParent(nodes, buildParentMap(nodes), targetNodeId);

  // delete the placeholder node and its edges
  delete nodes.nodes[targetNodeId];
  delete nodes.edges[targetNodeId];

  // remove the placeholder from any edges that reference it
  Object.keys(nodes.edges).forEach(id => {
    nodes.edges[id] = nodes.edges[id].filter(i => i !== targetNodeId);
  });

  return sanitizeBlocksAndNodes(nodes);
};

const performDropOnEmptyStatePlaceholderNode = ({
  nodes,
  nodesInfo,
  sourceNodeId,
  targetNodeId,
}: DropOptions) => {
  const { childToParentMap } = nodesInfo;
  const targetParent = childToParentMap[targetNodeId]?.[0];
  setNodeChildren(nodes, { nodeId: targetParent, childNodes: [sourceNodeId] });
  delete nodes.nodes[targetNodeId];
  delete nodes.edges[targetNodeId];

  return { nodes };
};

export const performDropOnPlaceholderNode = (options: DropOptions) => {
  const { nodes, targetNodeId } = options;
  const targetNodeType = getType(nodes, targetNodeId);

  switch (targetNodeType) {
    case PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER:
      return performDropOnDropTargetPlaceholderNode(options);
    case PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER:
      return performDropOnEmptyStatePlaceholderNode(options);
    default:
      return { nodes };
  }
};
