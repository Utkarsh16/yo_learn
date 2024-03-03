import styled from '@emotion/styled';
import { Colors } from '@rippling/ui/Constants';

export const SidebarWrapper = styled.div`
  color: white;
  top: 5px;
  left: 5px;
  z-index: 1000;
  padding: 10px;
  border-right: 1px solid ${Colors.PLUM};
  width: 120px;
  flex-grow: 0;
  flex-shrink: 0;
  background-color: ${Colors.EGG_SHELL};
  height: 90vh;
`;

export const SidebarLabel = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
  color: ${Colors.PLUM};
`;

export const SidebarNode = styled.div`
  background: ${Colors.PLUM};
  color: ${Colors.WHITE};
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 10px;
`;
