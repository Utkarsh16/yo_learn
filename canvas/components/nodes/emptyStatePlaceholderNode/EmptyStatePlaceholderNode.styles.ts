import styled from '@emotion/styled';
import { Colors } from '@rippling/ui/Constants';
import Typography from '@rippling/ui/Typography';

export const EmptyStateContainer = styled.div<{
  x: number;
  y: number;
  width: number;
  height: number;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed ${Colors.GRAY3};
  border-radius: 8px;
  text-align: center;
  position: absolute;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -50%);
  transition:
    top 0.2s,
    left 0.2s;
`;

export const PlaceholderText = styled(Typography.Body2)`
  color: ${Colors.GRAY4};
  padding: 0 24px;
`;
