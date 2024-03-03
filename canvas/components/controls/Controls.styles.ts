import styled from '@emotion/styled';
import colors from '@rippling/ui/Constants/Colors';

export const ControlsWrapper = styled.div`
  position: absolute;
  right: 24px;
  top: 24px;
  z-index: 10;
  background: ${colors.WHITE};
  border: 1px solid ${colors.GRAY2};
  border-radius: 4px;
  overflow: hidden;
`;

/**
 * Zoom buttons styles
 */
export const ZoomButtonsBox = styled.div`
  background: ${colors.GRAY2};
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-gap: 1px;
  height: 32px;
`;

export const Item = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  font-weight: bold;
  padding: 4px;
  background: ${colors.WHITE};
`;
