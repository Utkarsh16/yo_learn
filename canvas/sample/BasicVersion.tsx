/* eslint-disable rippling-eslint/no-hard-coded-strings */
import React from 'react';
import Canvas from '..';
import { NODE_TYPES } from '../Canvas.enums';
import type { CanvasProps } from '../Canvas.types';
import Sidebar from './Sidebar/Sidebar';

const BasicVersion = () => {
  const [a] = ['A'];

  const [nodes, setNodes] = React.useState<CanvasProps['nodes']>({
    rootNode: 'A',
    edges: {},
    nodes: {
      [a]: {
        type: NODE_TYPES.DEFAULT,
      },
    },
  });

  const nodeRenderer = (nodeId: string) => {
    const nodeContent = `Node ${nodeId}`;
    return <div data-testid="sample-node-content">{nodeContent}</div>;
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}
    >
      <Sidebar />
      <Canvas
        nodes={nodes}
        onChange={({ nodes: updatedNodes }) => {
          setNodes(updatedNodes);
        }}
        nodeRenderer={nodeRenderer}
        emptyStatePlaceholderText="Drag a step here to start building your workflow"
        enableParallelDropZones
      />
    </div>
  );
};

export default BasicVersion;
