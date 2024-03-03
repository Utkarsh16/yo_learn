import styled from '@emotion/styled';
import { Colors } from '@rippling/ui/Constants';

export const DragShadowContainer = styled.div<{
  width: number;
  height: number;
}>`
  position: absolute;
  box-sizing: border-box;
  background-color: ${Colors.EGG_SHELL_DARK};
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: 8px;
`;
