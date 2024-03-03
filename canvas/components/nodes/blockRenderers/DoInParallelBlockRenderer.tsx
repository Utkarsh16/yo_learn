import React from 'react';
import { CANVAS_TRANSLATION_KEYS } from '../../../Canvas.constants';
import { PLACEHOLDER_NODES } from '../../../Canvas.enums';
import {
  getNodeBottomPosition,
  getNodeDimensions,
  getNodeTopPosition,
  getType,
  isOnceAllCompletedNode,
} from '../../../helpers/generalHelpers';
import {
  getBlockChildren,
  getNodeBranches,
  getNodeChildren,
} from '../../../helpers/nodeNavigation';
import { translateCanvasString } from '../../../helpers/translations';
import Arrow from '../../arrows/Arrows';
import DefaultNode from '../defaultNode/DefaultNode';
import renderNodeBasedOnType from '../nodeRenderers';
import type { NodeOptions } from '../nodes.types';

const DoInParallelBlockRenderer = (props: NodeOptions) => {
  const { nodes, nodeId: parentNodeId, nodePositions } = props;

  const branches = React.useMemo(
    () => getNodeBranches(nodes, parentNodeId),
    [nodes, parentNodeId]
  );

  const currentNodePosition = nodePositions[parentNodeId];
  if (!currentNodePosition) {
    return null;
  }

  const nodeDimensions = getNodeDimensions(getType(nodes, parentNodeId));
  const blockPosition = {
    ...currentNodePosition,
    y: currentNodePosition.y + nodeDimensions.height,
  };

  const childrenArrows: JSX.Element[] = [];
  const endArrows: JSX.Element[] = [];
  const branchNodesUI: JSX.Element[] = [];

  branches.forEach(branch => {
    const firstChildId = branch?.[0]; // picking the first child of the branch
    const lastChildId = branch[branch.length - 1]; // picking the last child of the branch

    const firstChildPosition = nodePositions[firstChildId];
    const lastChildPosition = nodePositions[lastChildId];
    const blockChildPosition =
      nodePositions[getBlockChildren(nodes, parentNodeId)[0]];

    if (!(firstChildPosition && lastChildPosition && blockChildPosition)) {
      return;
    }
    const childPosition = getNodeTopPosition(
      firstChildPosition,
      nodeDimensions
    );

    const connectingPosition = getNodeTopPosition(
      blockChildPosition,
      nodeDimensions
    );
    const lastChildChildren = getNodeChildren(nodes, lastChildId);
    const isChildOnceAllCompletedNode = isOnceAllCompletedNode(
      getType(nodes, lastChildChildren[0])
    );

    childrenArrows.push(
      <Arrow
        id={`do_in_parallel_child_arrow_${firstChildId}`}
        key={firstChildId}
        fromPosition={blockPosition}
        toPosition={childPosition}
        nodeDimensions={nodeDimensions}
        isLShapedDiverging
        hideArrowMarker={
          getType(nodes, firstChildId) ===
          PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
        }
      />
    );

    endArrows.push(
      <React.Fragment key={lastChildId}>
        <Arrow
          id={`do_in_parallel_arrow_converging_${lastChildId}`}
          fromPosition={getNodeBottomPosition(
            lastChildPosition,
            nodeDimensions
          )}
          toPosition={connectingPosition}
          nodeDimensions={nodeDimensions}
          isLShapedConverging={isChildOnceAllCompletedNode}
          hideArrowMarker={isChildOnceAllCompletedNode}
        />
      </React.Fragment>
    );

    branch.forEach((nodeId, nodeIndex) => {
      const isLastNodeInBranch = nodeIndex === branch.length - 1;
      branchNodesUI.push(
        <React.Fragment key={nodeId}>
          {renderNodeBasedOnType({
            ...props,
            nodeId,
            type: getType(nodes, nodeId),
            nodeChildren: getNodeChildren(nodes, nodeId),
            shouldHideArrow: isLastNodeInBranch,
          })}
        </React.Fragment>
      );
    });
  });

  return (
    <>
      <DefaultNode
        testId={`do_in_parallel_node_${parentNodeId}`}
        nodeId={parentNodeId}
        nodePosition={currentNodePosition}
        dimensions={nodeDimensions}
      >
        {`${translateCanvasString(
          CANVAS_TRANSLATION_KEYS.DO_IN_PARALLEL
        )} ${parentNodeId}`}
      </DefaultNode>
      <Arrow
        id={`do_in_parallel_node_arrow_${parentNodeId}`}
        fromPosition={getNodeBottomPosition(
          currentNodePosition,
          nodeDimensions
        )}
        toPosition={blockPosition}
        nodeDimensions={nodeDimensions}
        hideArrowMarker
      />
      {childrenArrows}
      {branchNodesUI}
      {endArrows}
    </>
  );
};

export default DoInParallelBlockRenderer;
