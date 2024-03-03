import React from 'react';
import { Icon, Tip, Typography } from '@rippling/ui';
import { Colors } from '@rippling/ui/Constants';
import { CANVAS_TRANSLATION_KEYS } from '../../Canvas.constants';
import { translateCanvasString } from '../../helpers/translations';
import { ZOOM_CONSTANTS } from './Controls.constants';
import { Item, ZoomButtonsBox } from './Controls.styles';

type ZoomButtonsProps = {
  value: number;
  onChange: (value: number) => void;
};

const ZoomButtons = ({ value, onChange }: ZoomButtonsProps) => {
  const handleZoomIn = () => {
    if (value < ZOOM_CONSTANTS.ZOOM_IN_LIMIT) {
      onChange(value + ZOOM_CONSTANTS.ZOOM_STEP);
    }
  };

  const handleZoomOut = () => {
    if (value > ZOOM_CONSTANTS.ZOOM_OUT_LIMIT) {
      onChange(value - ZOOM_CONSTANTS.ZOOM_STEP);
    }
  };

  const renderZoomButtons = ({
    type,
    isDisabled,
    tipContent,
    onClick,
    testId,
  }: {
    testId: string;
    type: string;
    isDisabled: boolean;
    tipContent: string;
    onClick: () => void;
  }) => {
    return (
      <Icon
        testId={testId}
        size={14}
        type={type}
        isDisabled={isDisabled}
        onClick={onClick}
        color={Colors.PLUM}
        tip={{
          placement: Tip.PLACEMENTS.LEFT,
          content: tipContent,
        }}
      />
    );
  };

  return (
    <ZoomButtonsBox>
      <Item>
        {renderZoomButtons({
          testId: 'zoom-in',
          type: Icon.TYPES.ZOOM_IN_OUTLINE,
          isDisabled: value >= ZOOM_CONSTANTS.ZOOM_IN_LIMIT,
          tipContent: translateCanvasString(
            CANVAS_TRANSLATION_KEYS.ZOOM_IN_TIP
          ),
          onClick: handleZoomIn,
        })}
      </Item>
      <Item>
        <Typography.Body2 color={Colors.PLUM}>
          {`${Math.round(value * 100)}%`}
        </Typography.Body2>
      </Item>
      <Item>
        {renderZoomButtons({
          testId: 'zoom-out',
          type: Icon.TYPES.ZOOM_OUT_OUTLINE,
          isDisabled: value <= ZOOM_CONSTANTS.ZOOM_OUT_LIMIT,
          tipContent: translateCanvasString(
            CANVAS_TRANSLATION_KEYS.ZOOM_OUT_TIP
          ),
          onClick: handleZoomOut,
        })}
      </Item>
    </ZoomButtonsBox>
  );
};

export default ZoomButtons;
