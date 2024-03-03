import { flattenDeep as _flattenDeep } from 'lodash';
import {
  getType,
  isABlock,
  isPlaceholderNode,
} from '../../helpers/generalHelpers';
import { getNodeBranches } from '../../helpers/nodeNavigation';
import { sanitizeBlocksAndNodes } from '../../helpers/nodeProcessors';
import { addPlaceholderNodesForWholeBlock } from '../nodeStoreSlice/nodeStoreSlice.helpers';
import { performDropOnBasicNodes } from './basicDrag.helpers';
import { performDropOnBlockNodes } from './blockDrag.helpers';
import type { DropOptions } from './dragStoreSlice.types';
import { performDropOnPlaceholderNode } from './placeholderDrop.helpers';

/**
 * This function is used to update the nodes after a drop operation
 *
 * NOTE: This function assumes that the source and target nodes, both have exactly one parent
 */
export const getUpdatedNodesAndBlocksAfterDrop = (options: DropOptions) => {
  const { nodes, sourceNodeId, targetNodeId, newNode } = options;
  const targetNodeType = getType(nodes, targetNodeId);
  const sourceNodeType = getType(nodes, sourceNodeId);

  if (newNode) {
    nodes.nodes[newNode.id] = newNode;

    /**
     * Initialise the block nodes if the new node is a block
     */
    if (isABlock(newNode.type)) {
      nodes.edges[newNode.id] = [];
      addPlaceholderNodesForWholeBlock(nodes, newNode.id);
    }
  } else {
    // Do not allow dropping on a node which is within the source block's branches
    const isSourceABlock = isABlock(sourceNodeType);
    if (isSourceABlock) {
      const sourceBranches = _flattenDeep(getNodeBranches(nodes, sourceNodeId));
      if (sourceBranches.includes(targetNodeId)) {
        return sanitizeBlocksAndNodes(nodes);
      }
    }
  }

  switch (true) {
    case isABlock(targetNodeType):
      return performDropOnBlockNodes(options);
    case isPlaceholderNode(targetNodeType):
      return performDropOnPlaceholderNode(options);
    default:
      return performDropOnBasicNodes(options);
  }
};
