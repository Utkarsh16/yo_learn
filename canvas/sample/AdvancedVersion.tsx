/* eslint-disable rippling-eslint/no-hard-coded-strings */
import React from 'react';
import Canvas from '..';
import { NODE_TYPES } from '../Canvas.enums';
import type { CanvasProps } from '../Canvas.types';
import Sidebar from './Sidebar/Sidebar';

function AdvancedVersion() {
  const [nodes, setNodes] = React.useState<CanvasProps['nodes']>({
    rootNode: 'A',
    nodes: {
      A: {
        type: NODE_TYPES.DEFAULT,
      },
      B: {
        type: NODE_TYPES.IF_ELSE,
        trueNode: 'I',
        falseNode: 'K',
      },
      I: {
        type: NODE_TYPES.DEFAULT,
      },
      K: {
        type: NODE_TYPES.DEFAULT,
      },
      J: {
        type: NODE_TYPES.FOR_EACH,
        body: 'E',
      },
      G: {
        type: NODE_TYPES.DEFAULT,
      },
      C: {
        type: NODE_TYPES.IF_ELSE,
        trueNode: null,
        falseNode: null,
      },
      D: {
        type: NODE_TYPES.DEFAULT,
      },
      E: {
        type: NODE_TYPES.DEFAULT,
      },
    },
    edges: {
      A: ['B'],
      B: ['G'],
      I: ['D'],
      D: ['J'],
      E: ['C'],
    },
  });

  const nodeRenderer = (nodeId: string) => {
    const nodeContent = `Node ${nodeId}`;
    return <div>{nodeContent}</div>;
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
      />
    </div>
  );
}

export default AdvancedVersion;
