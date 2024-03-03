import styled from '@emotion/styled';
import { Colors } from '@rippling/ui/Constants';

export const DropTargetContainer = styled.div<{
  x: number;
  y: number;
  width: number;
  height: number;
}>`
  z-index: 50;
  position: absolute;
  box-sizing: border-box;
  border: 1px dashed ${Colors.YELLOW};
  background-color: ${Colors.TAN};
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  left: ${props => props.x - props.width / 2}px;
  top: ${props => props.y - props.height / 2}px;
  border-radius: 3px;
`;
