import React, { useMemo } from 'react';
import { isEqual as _isEqual } from 'lodash';
import {
  CANVAS_TRANSLATION_KEYS,
  NODE_SPACING,
} from '../../../Canvas.constants';
import { NODE_TYPES, PLACEHOLDER_NODES } from '../../../Canvas.enums';
import type { NodePosition } from '../../../Canvas.types';
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
import { translateCanvasString } from '../../../helpers/translations';
import Arrow from '../../arrows/Arrows';
import LoopArrow from '../../arrows/LoopArrow';
import DefaultNode from '../defaultNode/DefaultNode';
import DoInParallelNode from '../doInParallelNode/DoInParallelNode';
import renderNodeBasedOnType from '../nodeRenderers';
import type { NodeOptions } from '../nodes.types';

function useGetLoopWidth(args: {
  dag: NodeOptions['nodes'];
  positions: NodeOptions['nodePositions'];
  startNode: string;
  targetNode: string;
}) {
  const { dag, positions, startNode, targetNode } = args;

  const defaultLoopWidth = useMemo(() => {
    // Since we are finding deltaX wrt node position, we need some buffer to make sure the loop arrow goes around the node
    const BUFFER_IN_PX = 30;
    return getNodeDimensions(getType(dag, startNode)).width / 2 + BUFFER_IN_PX;
  }, [dag, startNode]);

  const loopWidth = useMemo(() => {
    let currentNode = startNode;
    let minX = Infinity;
    const startPosition = positions[startNode]?.x || 0;
    let subTreeForLoops = 0;

    while (currentNode) {
      if (currentNode === targetNode) {
        break;
      }

      const currentNodeX = positions[currentNode]?.x ?? 0;
      minX = Math.min(minX, currentNodeX);
      if (
        (currentNode !== startNode && dag.nodes[currentNode].type) ===
        NODE_TYPES.FOR_EACH
      ) {
        subTreeForLoops += 1;
      }

      const children = getNodeChildren(dag, currentNode);
      currentNode = children?.[0];
    }

    const deltaFromStartNode = startPosition - minX;
    const deltaForSubTreeForLoops = subTreeForLoops * defaultLoopWidth;

    // Adding defaultLoopWidth to make sure the loop arrow goes around the node
    return deltaFromStartNode + deltaForSubTreeForLoops + defaultLoopWidth;
  }, [dag, positions, startNode, targetNode]);

  return loopWidth;
}

const ForEachBlockRenderer = (props: NodeOptions) => {
  const {
    nodeId: parentNodeId,
    nodePositions,
    nodes,
    nodeChildren = [],
    parentBlock,
  } = props;

  const { blockChildren, branch } = useMemo(
    () => ({
      blockChildren: getBlockChildren(nodes, parentNodeId),
      branch: getNodeBranches(nodes, parentNodeId)[0],
    }),
    [nodes, parentNodeId]
  );

  const loopWidth = useGetLoopWidth({
    dag: nodes,
    positions: nodePositions,
    startNode: parentNodeId,
    targetNode: blockChildren[0],
  });

  const lastChildInBranch = branch[branch.length - 1];
  const nodeDimensions = getNodeDimensions(getType(nodes, parentNodeId));
  const blockParentPosition = nodePositions[parentNodeId];
  if (!blockParentPosition) {
    return null;
  }

  const childPosition = nodePositions[nodeChildren[0]];
  const childType = getType(nodes, nodeChildren[0]);
  const childNodeDimensions = getNodeDimensions(childType);
  const isChildPlaceholderNode =
    childType === PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER;
  const blockPosition = getNodeTopPosition(childPosition, childNodeDimensions); // child node top
  if (!blockPosition) {
    return null;
  }

  const blockChildPosition = nodePositions[blockChildren[0]];
  if (!blockChildPosition) {
    return null;
  }

  const parentBlockChildren = getBlockChildren(nodes, parentBlock);
  const sameChildrenForBlockAndItsParent = _isEqual(
    blockChildren,
    parentBlockChildren
  );

  return (
    <>
      {/* Parent node of type FOR_EACH */}
      <DefaultNode
        testId={`forEach_node_${parentNodeId}`}
        nodeId={parentNodeId}
        nodePosition={blockParentPosition}
        dimensions={nodeDimensions}
      >
        {/* eslint-disable-next-line rippling-eslint/no-hard-coded-strings */}
        <>FOR EACH {parentNodeId}</>
      </DefaultNode>
      <Arrow
        id={`for_node_arrow_${parentNodeId}`}
        fromPosition={getNodeBottomPosition(
          blockParentPosition,
          nodeDimensions
        )}
        toPosition={blockPosition}
        nodeDimensions={nodeDimensions}
        hideArrowMarker={isChildPlaceholderNode}
      />

      {/* Render branch nodes of the for-each block */}
      {branch.map((nodeId, index) => (
        <React.Fragment key={nodeId}>
          {renderNodeBasedOnType({
            ...props,
            nodeId,
            type: getType(nodes, nodeId),
            nodeChildren: getNodeChildren(nodes, nodeId),
            shouldHideArrowMarker: index === branch.length - 1,
            shouldHideArrow:
              index === branch.length - 1 && sameChildrenForBlockAndItsParent,
          })}
        </React.Fragment>
      ))}

      {/* Loop arrow */}
      <LoopArrow
        id={`for_loop_arrow_${lastChildInBranch}`}
        fromPosition={{
          ...blockChildPosition,
          y: blockChildPosition?.y - NODE_SPACING.vertical / 2,
        }}
        toPosition={blockParentPosition as NodePosition}
        nodeDimensions={nodeDimensions}
        loopWidth={loopWidth}
      />

      {/* AFTER LAST node */}
      {blockChildPosition && (
        <DoInParallelNode
          nodePosition={blockChildPosition}
          text={translateCanvasString(CANVAS_TRANSLATION_KEYS.AFTER_LAST)}
        />
      )}
    </>
  );
};

export default React.memo(ForEachBlockRenderer);
