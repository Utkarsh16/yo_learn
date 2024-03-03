import styled from '@emotion/styled';

export const EndTextContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -50%);
`;
