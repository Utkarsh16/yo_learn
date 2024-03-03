import React from 'react';
import { PLACEHOLDER_NODES } from '../../../Canvas.enums';
import {
  getNodeBottomPosition,
  getNodeDimensions,
  getNodeTopPosition,
  getType,
} from '../../../helpers/generalHelpers';
import {
  getBlockChildren,
  getNodeBranches,
  getNodeChildren,
} from '../../../helpers/nodeNavigation';
import Arrow from '../../arrows/Arrows';
import DefaultNode from '../defaultNode/DefaultNode';
import renderNodeBasedOnType from '../nodeRenderers';
import type { NodeOptions } from '../nodes.types';

/**
 * NOTE -
 *
 * The IF_ELSE block can have only 2 branches, so the loops have been kept static to 2, that is, ['YES', 'NO']
 */

const IfElseBlockRenderer = (props: NodeOptions) => {
  const { nodePositions, nodes, type, nodeId: parentNodeId } = props;
  const branches = React.useMemo(
    () => getNodeBranches(nodes, parentNodeId),
    [nodes, parentNodeId]
  );
  const nodeDimensions = getNodeDimensions(type);
  const currentNodePosition = nodePositions[parentNodeId];
  const parentDimensions = getNodeDimensions(getType(nodes, parentNodeId));
  if (!currentNodePosition) {
    return null;
  }
  const blockPosition = {
    x: currentNodePosition.x,
    y: currentNodePosition.y + (3 * parentDimensions.height) / 4,
  };

  // Pass 1
  const childrenArrows: null | (null | JSX.Element)[] = ['YES', 'NO'].map(
    (branchText: string, index: number) => {
      // if the branch is empty, don't render the arrow
      if (!branches[index]?.length) {
        return null;
      }

      const childId = branches[index][0]; // picking the first child of the branch
      const childPosition = getNodeTopPosition(
        nodePositions[childId],
        nodeDimensions
      ); // child node top

      if (!childPosition) {
        return null;
      }

      const isChildDropPlaceholder =
        getType(nodes, childId) === PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER;

      return (
        <Arrow
          key={childId}
          id={`if_child_arrow_${childId}`}
          fromPosition={blockPosition}
          toPosition={childPosition}
          nodeDimensions={nodeDimensions}
          text={branchText}
          hideArrowMarker={isChildDropPlaceholder}
          isLShapedDiverging
        />
      );
    }
  );

  // Pass 2
  const endArrows: null | (null | JSX.Element)[] = ['YES', 'NO'].map(
    (_: string, index: number) => {
      // if the branch is empty, don't render the arrow
      if (!branches[index]?.length) {
        return null;
      }

      const lastChildId = branches[index][branches[index].length - 1]; // picking the last child of the branch
      const lastChildPosition = nodePositions[lastChildId];
      if (!lastChildPosition) {
        return null;
      }
      const blockChildren = getBlockChildren(nodes, parentNodeId);
      const blockChildPosition = nodePositions[blockChildren[0]];
      const blockEndPosition = getNodeTopPosition(
        blockChildPosition,
        nodeDimensions
      );
      const arrowFromPosition = getNodeBottomPosition(
        lastChildPosition,
        nodeDimensions
      );

      if (!(blockEndPosition && arrowFromPosition)) {
        return null;
      }

      return (
        <React.Fragment key={lastChildId}>
          <Arrow
            id={`if_arrow_converging_${lastChildId}`}
            fromPosition={arrowFromPosition}
            toPosition={blockEndPosition}
            nodeDimensions={nodeDimensions}
            isLShapedConverging
            hideArrowMarker
          />
        </React.Fragment>
      );
    }
  );

  const branchNodesUI: JSX.Element[] = [];
  ['YES', 'NO'].forEach((_: string, index: number) => {
    const branch = branches[index];

    // if the branch is empty, don't render the node
    if (!branch?.length) {
      return;
    }

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
        testId={`ifElse_node_${parentNodeId}`}
        nodeId={parentNodeId}
        nodePosition={currentNodePosition}
        dimensions={nodeDimensions}
      >
        {/* eslint-disable-next-line rippling-eslint/no-hard-coded-strings */}
        <>IF ELSE {parentNodeId}</>
      </DefaultNode>
      <Arrow
        id={`if_node_arrow_${parentNodeId}`}
        fromPosition={{
          x: currentNodePosition.x,
          y: currentNodePosition.y + nodeDimensions.height / 2, // from the node bottom
        }}
        toPosition={blockPosition}
        nodeDimensions={nodeDimensions}
        hideArrowMarker
      />

      {/* Arrows from the IF_ELSE node to first child of each branch */}
      {childrenArrows}

      {/* Render branches of the for each block */}
      {branchNodesUI}

      {/* Arrows from the last child of each branch to the blockEnd position after the block */}
      {endArrows}
    </>
  );
};

export default React.memo(IfElseBlockRenderer);
