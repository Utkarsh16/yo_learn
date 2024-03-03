import React from 'react';
import {
  getNodeBottomPosition,
  getNodeDimensions,
} from '../../../helpers/generalHelpers';
import Arrow from '../../arrows/Arrows';
import EmptyState from '../emptyStatePlaceholderNode/EmptyStatePlaceholderNode';
import type { NodeOptions } from '../nodes.types';

const EmptyStateNodeRenderer = (props: NodeOptions) => {
  const { nodeId, nodePositions, type } = props;

  const currentNodePosition = nodePositions[nodeId];
  if (!currentNodePosition) {
    return null;
  }
  const nodeDimensions = getNodeDimensions(type);

  return (
    <>
      <EmptyState
        nodeId={nodeId}
        nodePosition={currentNodePosition}
        dimensions={nodeDimensions}
      />
      <Arrow
        id={`empty_state_arrow_${nodeId}`}
        fromPosition={getNodeBottomPosition(
          currentNodePosition,
          nodeDimensions
        )}
        // End arrow automatically adds extra length to the arrow, so that toPosition is same as fromPosition
        toPosition={getNodeBottomPosition(currentNodePosition, nodeDimensions)}
        nodeDimensions={{
          height: nodeDimensions.height / 2,
          width: 0, // irrelevant, not used to draw the END arrow
        }}
        isEndArrow
      />
    </>
  );
};

export default React.memo(EmptyStateNodeRenderer);
