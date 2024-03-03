import React, { useMemo } from 'react';
import type { NodeDimensions, NodePosition } from '../../../Canvas.types';
import { useCanvasPropsContext } from '../../../canvasContainer/canvasContainer.context';
import {
  useGetDragStore,
  useGetNodesStore,
  useGetPropsStore,
} from '../../../stores/useCanvasStore';
import { Box, BoxContainer } from './DefaultNode.styles';

type DefaultNodeProps = React.PropsWithChildren<{
  testId: string;
  nodeId: string;
  dimensions: NodeDimensions;
  nodePosition: NodePosition;
}>;

const DefaultNode = ({
  children,
  nodeId,
  dimensions,
  nodePosition,
  testId,
}: DefaultNodeProps) => {
  const { width, height } = dimensions;
  const { x, y } = nodePosition;

  const { drag, startDrag } = useGetDragStore();
  const {
    nodesInfo: { rootNode },
    selectedNodeId,
    setSelectedNodeId,
  } = useGetNodesStore();
  const {
    propsInStore: { isLocked },
  } = useGetPropsStore();

  const dragging = useMemo(() => {
    if (!drag) return false;

    return drag?.nodeId === nodeId && drag?.moved;
  }, [drag, nodeId]);

  const selected = useMemo(() => {
    return selectedNodeId === nodeId;
  }, [nodeId, selectedNodeId]);

  const isRootNode = nodeId === rootNode;
  const canDragNode = !isLocked && !isRootNode;

  const { onNodeSelected } = useCanvasPropsContext();

  return (
    <>
      <BoxContainer
        style={{
          // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
          cursor: canDragNode ? undefined : 'initial',
          left: x,
          top: y,
        }}
        data-testid={testId}
        data-nodeid={nodeId}
        dragging={dragging}
        width={width}
        height={height}
        onMouseDown={e => {
          if (canDragNode) {
            startDrag(nodeId, e.clientX, e.clientY);
          }
        }}
        onClick={e => {
          e.stopPropagation();
          setSelectedNodeId(nodeId);
          onNodeSelected?.(nodeId);
        }}
      >
        <Box
          selected={selected}
          style={{
            width,
            height,
          }}
        >
          {children}
        </Box>
      </BoxContainer>
    </>
  );
};

export default React.memo(DefaultNode);
