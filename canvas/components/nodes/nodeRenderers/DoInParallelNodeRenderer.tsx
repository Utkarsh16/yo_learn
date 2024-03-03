import React from 'react';
import {
  CANVAS_TRANSLATION_KEYS,
  NODE_SPACING,
} from '../../../Canvas.constants';
import {
  getNodeDimensions,
  getNodeTopPosition,
} from '../../../helpers/generalHelpers';
import { translateCanvasString } from '../../../helpers/translations';
import Arrow from '../../arrows/Arrows';
import DoInParallelNode from '../doInParallelNode/DoInParallelNode';
import type { NodeOptions } from '../nodes.types';

const DoInParallelNodeRenderer = (props: NodeOptions) => {
  const { nodeId, nodePositions, nodeChildren } = props;

  const nodeDimensions = getNodeDimensions();
  const { height } = nodeDimensions;
  const heightWithPadding = height + NODE_SPACING.vertical;

  const nodePosition = nodePositions[nodeId];
  if (!nodePosition) {
    return null;
  }
  const { x, y } = nodePosition;
  const doInParallelNodePosition = {
    x,
    y: y + heightWithPadding / 2,
  };

  const childrenArrows = (nodeChildren || []).map((childId: string) => {
    const childPosition = getNodeTopPosition(
      nodePositions[childId],
      nodeDimensions
    );
    if (!childPosition) {
      return null;
    }

    return (
      <Arrow
        key={childId}
        id={`do_in_parallel_arrow_${childId}`}
        fromPosition={doInParallelNodePosition}
        toPosition={childPosition}
        nodeDimensions={nodeDimensions}
        isLShapedDiverging
      />
    );
  });

  return (
    <>
      <DoInParallelNode
        nodePosition={doInParallelNodePosition}
        text={translateCanvasString(CANVAS_TRANSLATION_KEYS.DO_IN_PARALLEL)}
      />
      {childrenArrows}
    </>
  );
};

export default React.memo(DoInParallelNodeRenderer);
