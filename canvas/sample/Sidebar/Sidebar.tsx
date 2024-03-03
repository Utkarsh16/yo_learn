/* eslint-disable rippling-eslint/no-hard-coded-strings */
import React, { type DragEvent } from 'react';
import { NODE_DATA_TRANSFER_KEY } from '../../Canvas.constants';
import { NODE_TYPES } from '../../Canvas.enums';
import { SidebarLabel, SidebarNode, SidebarWrapper } from './Sidebar.styles';

const Sidebar = ({ isBasic = false }: { isBasic?: boolean }) => {
  const onDragStart = (nodeData: any) => (event: DragEvent) => {
    const dataString = JSON.stringify(nodeData);
    event.dataTransfer.setData(NODE_DATA_TRANSFER_KEY, dataString);
  };
  if (isBasic) {
    return (
      <SidebarWrapper>
        <SidebarLabel>
          You can drag nodes from the sidebar and drop them on the canvas
        </SidebarLabel>
        <div>
          <SidebarNode
            data-testid="sidebar-node-a"
            onDragStart={onDragStart({
              content: 'BASIC NODE A',
              type: NODE_TYPES.DEFAULT,
            })}
            draggable
          >
            BASIC NODE A
          </SidebarNode>
          <SidebarNode
            data-testid="sidebar-node-b"
            onDragStart={onDragStart({
              content: ' BASIC NODE B',
              type: NODE_TYPES.DEFAULT,
            })}
            draggable
          >
            BASIC NODE B
          </SidebarNode>
          <SidebarNode
            data-testid="sidebar-node-c"
            onDragStart={onDragStart({
              content: ' BASIC NODE C',
              type: NODE_TYPES.DEFAULT,
            })}
            draggable
          >
            BASIC NODE C
          </SidebarNode>
        </div>
      </SidebarWrapper>
    );
  }
  return (
    <SidebarWrapper>
      <SidebarLabel>
        You can drag nodes from the sidebar and drop them on the canvas
      </SidebarLabel>
      <div>
        <SidebarNode
          data-testid="sidebar-node-a"
          onDragStart={onDragStart({
            content: 'BASIC NODE A',
            type: NODE_TYPES.DEFAULT,
          })}
          draggable
        >
          BASIC NODE A
        </SidebarNode>
        <SidebarNode
          data-testid="sidebar-node-b"
          onDragStart={onDragStart({
            content: 'IF ELSE B',
            type: NODE_TYPES.IF_ELSE,
          })}
          draggable
        >
          IF ELSE B
        </SidebarNode>
        <SidebarNode
          data-testid="sidebar-node-c"
          onDragStart={onDragStart({
            content: 'FOR EACH C',
            type: NODE_TYPES.FOR_EACH,
          })}
          draggable
        >
          FOR EACH C
        </SidebarNode>
        <SidebarNode
          data-testid="sidebar-node-d"
          onDragStart={onDragStart({
            content: 'DO IN PARALLEL D',
            type: NODE_TYPES.DO_IN_PARALLEL,
          })}
          draggable
        >
          DO IN PARALLEL D
        </SidebarNode>
      </div>
    </SidebarWrapper>
  );
};

export default Sidebar;
