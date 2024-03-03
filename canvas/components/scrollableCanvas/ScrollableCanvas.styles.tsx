import styled from '@emotion/styled';
import Colors from '@rippling/ui/Constants/Colors';

export const ContainerDiv = styled.div<{
  isDragging: boolean;
  height: string | number;
}>`
  ${({ isDragging }) => (isDragging ? `cursor: pointer;` : null)}
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: ${Colors.EGG_SHELL};
  background-image: radial-gradient(${Colors.GRAY2} 1px, transparent 0);
  background-size: 10px 10px;
`;

export const ContentDiv = styled.div<{
  offset: { x: number; y: number };
}>`
  position: absolute;
  ${({ offset }) => `
    top: ${offset.y}px; 
    left: ${offset.x}px;
  `}
`;
