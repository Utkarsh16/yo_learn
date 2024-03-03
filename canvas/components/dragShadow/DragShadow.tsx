import React from 'react';
import { getNodeDimensions } from '../../helpers/generalHelpers';
import { useGetDragStore, useGetNodesStore } from '../../stores/useCanvasStore';
import { DragShadowContainer } from './DragShadow.styles';

const DragShadow = () => {
  const { selectedNodeId, nodesInfo } = useGetNodesStore();
  const { drag } = useGetDragStore();
  if (!drag || !drag.moved || !selectedNodeId) return null;

  const { nodesClone } = nodesInfo;
  const node = nodesClone.nodes[selectedNodeId];
  if (!node) {
    return null;
  }

  const nodeDimensions = getNodeDimensions(node.type);
  const { width, height } = nodeDimensions;

  const shouldRenderDragShadow = !drag.outsideDrag;

  return (
    <>
      {shouldRenderDragShadow && (
        <DragShadowContainer
          data-testid="drag-shadow"
          style={{
            left: drag.x - width / 2,
            top: drag.y - height / 2,
          }}
          width={width}
          height={height}
        />
      )}
    </>
  );
};

export default DragShadow;
