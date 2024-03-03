import React from 'react';
import { NODE_TYPES } from '../../../Canvas.enums';
import type { NodeOptions } from '../nodes.types';
import DoInParallelBlockRenderer from './DoInParallelBlockRenderer';
import ForEachBlockRenderer from './ForEachBlockRenderer';
import IfElseBlockRenderer from './IfElseBlockRenderer';

const renderBlockBasedOnType = (nodeInfo: NodeOptions) => {
  if (!nodeInfo.nodePositions[nodeInfo.nodeId]) {
    return null;
  }

  switch (nodeInfo.type) {
    case NODE_TYPES.IF_ELSE:
      return <IfElseBlockRenderer {...nodeInfo} />;
    case NODE_TYPES.FOR_EACH:
      return <ForEachBlockRenderer {...nodeInfo} />;
    case NODE_TYPES.DO_IN_PARALLEL:
      return <DoInParallelBlockRenderer {...nodeInfo} />;
    default:
      return null;
  }
};

export default renderBlockBasedOnType;
