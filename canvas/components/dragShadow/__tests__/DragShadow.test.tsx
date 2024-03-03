import React from 'react';
import { render, screen } from '@testing-library/react';
import { NODE_TYPES } from '../../../Canvas.enums';
import {
  useGetDragStore,
  useGetNodesStore,
} from '../../../stores/useCanvasStore';
import DragShadow from '../DragShadow';

describe('DragShadow', () => {
  function TestComponent({ nonexistentNode }: { nonexistentNode?: boolean }) {
    // DragShadow uses the zustand store to get/set the selected id
    const { setSelectedNodeId, setNodesInfo } = useGetNodesStore();
    const { startDrag, handleDrag } = useGetDragStore();

    React.useEffect(() => {
      setNodesInfo({
        nodes: {
          a: {
            type: NODE_TYPES.DEFAULT,
          },
        },
        edges: {},
        rootNode: 'a',
      });
    }, [setNodesInfo]);

    React.useEffect(() => {
      startDrag('a', 100, 100);
      handleDrag(
        new MouseEvent('', {}) as unknown as React.MouseEvent<HTMLDivElement>
      );

      if (nonexistentNode) {
        setSelectedNodeId('non_existent');
      }
    }, [setSelectedNodeId, startDrag, handleDrag, nonexistentNode]);

    return <DragShadow />;
  }

  it('should render a DragShadow when the user drags a node', async () => {
    render(<TestComponent />);

    const dragShadow = await screen.queryByTestId('drag-shadow');
    expect(dragShadow).toBeInTheDocument();
  });

  it('should not crash if the selected node does not exist in the nodes map', async () => {
    render(<TestComponent nonexistentNode />);

    const dragShadow = screen.queryByTestId('drag-shadow');
    expect(dragShadow).not.toBeInTheDocument();
  });
});
