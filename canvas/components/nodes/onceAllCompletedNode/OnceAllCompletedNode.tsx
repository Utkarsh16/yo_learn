import React from 'react';
import { Typography } from '@rippling/ui';
import { Colors } from '@rippling/ui/Constants';
import Arrow from 'app/products/platform/HubPlatform/components/canvas/components/arrows/Arrows';
import { CANVAS_TRANSLATION_KEYS } from '../../../Canvas.constants';
import { NODE_TYPES, UTILITY_NODES } from '../../../Canvas.enums';
import type { CanvasGraph, NodePositionMap } from '../../../Canvas.types';
import {
  getNodeDimensions,
  getNodeTopPosition,
  getType,
} from '../../../helpers/generalHelpers';
import { translateCanvasString } from '../../../helpers/translations';
import { OnceAllCompletedBox } from './OnceAllCompletedNode.styles';

type OnceAllCompletedNodeProps = {
  nodeId: string;
  nodePositions: NodePositionMap;
  nodeChildren: string[];
  nodes: CanvasGraph;
};

const OnceAllCompletedNode = ({
  nodeId,
  nodePositions,
  nodeChildren,
  nodes,
}: OnceAllCompletedNodeProps) => {
  const nodeDimensions = getNodeDimensions(UTILITY_NODES.ONCE_ALL_COMPLETED);
  const initialNodePosition = nodePositions[nodeId];
  const nodePosition = getNodeTopPosition(initialNodePosition, nodeDimensions);
  if (!nodePosition) {
    return null;
  }

  const renderChildrenArrows = () => {
    if (!nodeChildren || nodeChildren.length === 0)
      return (
        <Arrow
          id={nodeId}
          key={`end_arrow_${nodeId}`}
          fromPosition={nodePosition}
          toPosition={nodePosition}
          nodeDimensions={nodeDimensions}
          isEndArrow
        />
      );

    const arrows = nodeChildren?.map((childId: string) => {
      const nodeType = getType(nodes, childId);
      const childNodeDimensions = getNodeDimensions(nodeType);
      const childPosition = getNodeTopPosition(
        nodePositions[childId],
        childNodeDimensions
      );
      if (!childPosition) {
        return null;
      }

      const isActualNode = Object.values(NODE_TYPES).includes(
        nodeType as NODE_TYPES
      );

      return (
        <Arrow
          key={`once_all_completed_arrow_${childId}`}
          id={`once_all_completed_arrow_${childId}`}
          fromPosition={nodePosition}
          toPosition={childPosition}
          nodeDimensions={nodeDimensions}
          isLShapedConverging={!isActualNode}
          hideArrowMarker
        />
      );
    });
    return arrows;
  };
  return (
    <>
      <OnceAllCompletedBox cardPosition={nodePosition}>
        <Typography.Overline2 color={Colors.GRAY4}>
          {translateCanvasString(CANVAS_TRANSLATION_KEYS.ONCE_ALL_COMPLETED)}
        </Typography.Overline2>
      </OnceAllCompletedBox>
      {renderChildrenArrows()}
    </>
  );
};

export default React.memo(OnceAllCompletedNode);
