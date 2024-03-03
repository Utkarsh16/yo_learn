import styled from '@emotion/styled';
import { Colors } from '@rippling/ui/Constants';

export const Box = styled.div<{ selected: boolean }>(props => ({
  boxSizing: 'border-box',
  border: `2px solid ${props.selected ? Colors.V2_BLUE_C : Colors.GRAY2}`,
  borderStyle: 'solid',
  background: 'white',
  borderRadius: 8,
  padding: 10,
  zIndex: 5,
}));

export const BoxContainer = styled.div<{
  dragging: boolean;
  width: number;
  height: number;
}>`
  cursor: ${props => (props.dragging ? 'grabbing' : 'grab')};
  opacity: ${props => (props.dragging ? 0.5 : 1)};
  position: absolute;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  transform: translate(-50%, -50%);
  transition:
    top 0.2s,
    left 0.2s;
`;
