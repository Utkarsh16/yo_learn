import React from 'react';
import OnceAllCompletedNode from 'app/products/platform/HubPlatform/components/canvas/components/nodes/onceAllCompletedNode/OnceAllCompletedNode';
import {
  NODE_TYPES,
  PLACEHOLDER_NODES,
  UTILITY_NODES,
} from '../../../Canvas.enums';
import type { NodeOptions } from '../nodes.types';
import DefaultNodeRenderer from './DefaultNodeRenderer';
import DropPlaceholderNodeRenderer from './DropPlaceholderNodeRenderer';
import EmptyStateNodeRenderer from './EmptyStateNodeRenderer';

const renderNodeBasedOnType = (nodeInfo: NodeOptions) => {
  if (!nodeInfo.nodePositions[nodeInfo.nodeId]) return null;

  switch (nodeInfo.type) {
    case NODE_TYPES.DEFAULT:
      return <DefaultNodeRenderer {...nodeInfo} />;
    case UTILITY_NODES.ONCE_ALL_COMPLETED:
      return <OnceAllCompletedNode {...nodeInfo} />;
    case PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER:
      return <EmptyStateNodeRenderer {...nodeInfo} />;
    case PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER:
      return <DropPlaceholderNodeRenderer {...nodeInfo} />;
    default:
      return null;
  }
};

export default renderNodeBasedOnType;
