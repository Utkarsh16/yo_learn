import React from 'react';
import {
  getNodeBottomPosition,
  getNodeDimensions,
  getNodeTopPosition,
  getType,
  isOnceAllCompletedNode,
} from '../../../helpers/generalHelpers';
import Arrow from '../../arrows/Arrows';
import DefaultNode from '../defaultNode/DefaultNode';
import type { NodeOptions } from '../nodes.types';
import DoInParallelNodeRenderer from './DoInParallelNodeRenderer';

const DefaultNodeRenderer = (props: NodeOptions) => {
  const {
    type,
    nodeRenderer,
    nodeId,
    nodePositions,
    nodeChildren = [],
    nodes,
    shouldHideArrow,
    shouldHideArrowMarker,
  } = props;
  const nodeDimensions = getNodeDimensions(type);
  const currentNodePosition = nodePositions[nodeId];
  const childPosition = nodePositions[nodeChildren[0]];
  const childNodeType = getType(nodes, nodeChildren[0]);
  const childNodeDimensions = getNodeDimensions(childNodeType);

  const hasSingleChild = nodeChildren.length === 1;
  const hasNoChildren = nodeChildren.length === 0;
  const hasMultipleChildren = nodeChildren.length > 1;

  const isChildOnceAllCompletedNode = isOnceAllCompletedNode(childNodeType);

  if (!currentNodePosition) {
    return null;
  }

  const arrows = (
    <>
      {hasNoChildren && (
        <Arrow
          id={`default_node_end_arrow_${nodeId}`}
          fromPosition={getNodeBottomPosition(
            currentNodePosition,
            nodeDimensions
          )}
          toPosition={getNodeBottomPosition(
            currentNodePosition,
            nodeDimensions
          )} // End arrow automatically adds extra length to the arrow, so tha toPosition is same as fromPosition
          nodeDimensions={nodeDimensions}
          isEndArrow
        />
      )}
      {hasMultipleChildren && (
        <>
          <Arrow
            id={`default_node_arrow_${nodeId}`}
            fromPosition={getNodeBottomPosition(
              currentNodePosition,
              nodeDimensions
            )}
            toPosition={{
              x: currentNodePosition.x,
              y: currentNodePosition.y + nodeDimensions.height, // to the DO_IN_PARALLEL node top, which is below the current node
            }}
            nodeDimensions={nodeDimensions}
            hideArrowMarker
          />
          <DoInParallelNodeRenderer {...props} />
        </>
      )}
      {hasSingleChild && childPosition && (
        <Arrow
          id={`default_node_arrow_${nodeId}`}
          fromPosition={getNodeBottomPosition(
            currentNodePosition,
            nodeDimensions
          )}
          toPosition={
            getNodeTopPosition(childPosition, childNodeDimensions) // child node top
          }
          nodeDimensions={nodeDimensions}
          isLShapedConverging={isChildOnceAllCompletedNode}
          hideArrowMarker={shouldHideArrowMarker || isChildOnceAllCompletedNode}
        />
      )}
    </>
  );

  return (
    <>
      <DefaultNode
        testId={`default_node_${nodeId}`}
        nodeId={nodeId}
        nodePosition={currentNodePosition}
        dimensions={nodeDimensions}
      >
        {nodeRenderer(nodeId, nodes.nodes[nodeId])}
      </DefaultNode>
      {shouldHideArrow ? <></> : arrows}
    </>
  );
};

export default React.memo(DefaultNodeRenderer);
