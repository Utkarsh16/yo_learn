import React from 'react';
import type { NodeDimensions, NodePosition } from '../../../Canvas.types';
import { useGetPropsStore } from '../../../stores/useCanvasStore';
import {
  EmptyStateContainer,
  PlaceholderText,
} from './EmptyStatePlaceholderNode.styles';

type EmptyStatePlaceholderNodeProps = {
  nodeId: string;
  nodePosition: NodePosition;
  dimensions: NodeDimensions;
};

const EmptyStatePlaceholderNode = ({
  nodeId,
  nodePosition,
  dimensions,
}: EmptyStatePlaceholderNodeProps) => {
  const {
    propsInStore: { emptyStatePlaceholderText },
  } = useGetPropsStore();

  const { width, height } = dimensions;
  const { x, y } = nodePosition;

  return (
    <EmptyStateContainer
      id={nodeId}
      data-testid="empty-state-placeholder-node"
      x={x}
      y={y}
      width={width}
      height={height}
    >
      {emptyStatePlaceholderText ? (
        <PlaceholderText>{emptyStatePlaceholderText}</PlaceholderText>
      ) : null}
    </EmptyStateContainer>
  );
};

export default EmptyStatePlaceholderNode;
