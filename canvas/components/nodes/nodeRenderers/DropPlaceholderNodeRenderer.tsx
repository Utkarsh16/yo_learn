import React from 'react';
import { PLACEHOLDER_NODES } from '../../../Canvas.enums';
import {
  getNodeBottomPosition,
  getNodeDimensions,
  getNodeTopPosition,
} from '../../../helpers/generalHelpers';
import Arrow from '../../arrows/Arrows';
import type { NodeOptions } from '../nodes.types';

const DropPlaceholderNodeRenderer = (props: NodeOptions) => {
  const { nodeId, nodePositions, nodeChildren, shouldHideArrow } = props;

  const currentNodePosition = nodePositions[nodeId];
  if (!currentNodePosition) {
    return null;
  }
  const nodeDimensions = getNodeDimensions(
    PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
  );
  const childNodeId = nodeChildren[0];
  let childPosition = nodePositions[childNodeId];
  let isEndArrow = false;

  if (!childPosition) {
    childPosition = currentNodePosition;
    isEndArrow = true;
  }

  return (
    <>
      {/* Self arrow in place of the node UI, which connects from the node's top to node's bottom edge */}
      <Arrow
        id={`drop_placeholder_node_arrow_${nodeId}`}
        key={`arrow_${nodeId}`}
        fromPosition={getNodeTopPosition(currentNodePosition, nodeDimensions)}
        toPosition={getNodeBottomPosition(currentNodePosition, nodeDimensions)}
        nodeDimensions={nodeDimensions}
        hideArrowMarker
      />

      {/* Arrow connecting the placeholder node to its child node */}
      {!shouldHideArrow && (
        <Arrow
          id={`drop_placeholder_connect_arrow_${nodeId}`}
          key={`arrow_${nodeId}`}
          fromPosition={getNodeBottomPosition(
            currentNodePosition,
            nodeDimensions
          )}
          toPosition={getNodeTopPosition(childPosition, nodeDimensions)} // child node top
          nodeDimensions={nodeDimensions}
          isEndArrow={isEndArrow}
          hideArrowMarker={!isEndArrow}
        />
      )}
    </>
  );
};

export default React.memo(DropPlaceholderNodeRenderer);
