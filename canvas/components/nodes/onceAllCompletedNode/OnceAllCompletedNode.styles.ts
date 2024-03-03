import styled from '@emotion/styled';
import { Colors } from '@rippling/ui/Constants';

export const OnceAllCompletedBox = styled.div<{
  cardPosition: {
    x: number;
    y: number;
  };
}>`
  padding: 2px 8px;
  border-radius: 2px;
  border: 1px solid ${Colors.GRAY2};
  gap: 8px;
  position: absolute;
  top: ${props => props.cardPosition.y}px;
  left: ${props => props.cardPosition.x}px;
  transform: translate(-50%, -50%);
  background-color: ${Colors.WHITE};
  width: 200px;
  display: flex;
  justify-content: center;
  z-index: 2;
`;
