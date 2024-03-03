import React from 'react';
import { getDropTarget } from '../../helpers/dragDrop';
import {
  useGetDragStore,
  useGetNodesStore,
  useGetPropsStore,
} from '../../stores/useCanvasStore';
import { getDropTargetPosition } from './DropTarget.helpers';
import { DropTargetContainer } from './DropTarget.styles';

const DropTarget = () => {
  const { nodesInfo } = useGetNodesStore();
  const { drag } = useGetDragStore();
  const {
    propsInStore: { enableParallelDropZones },
  } = useGetPropsStore();

  if (!drag || !nodesInfo) return null;

  const dropTarget = getDropTarget(drag, nodesInfo, enableParallelDropZones);

  // If no drop target
  if (!dropTarget) return null;

  const { nodesClone, nodePositions } = nodesInfo;

  const dropTargetPosition = getDropTargetPosition({
    dropTarget,
    nodePositions,
    nodes: nodesClone,
  });

  if (!dropTargetPosition) return null;

  const { x, y, w, h } = dropTargetPosition;

  return <DropTargetContainer x={x} y={y} width={w} height={h} />;
};

export default DropTarget;
