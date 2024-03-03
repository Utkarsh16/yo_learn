import React from 'react';
import { ControlsWrapper } from './Controls.styles';
import ZoomButtons from './ZoomButtons';

type ControlsProps = {
  zoomLevel: number;
  setZoomLevel: (value: number) => void;
};

const Controls = ({ zoomLevel, setZoomLevel }: ControlsProps) => {
  const renderZoomControls = () => {
    return <ZoomButtons value={zoomLevel} onChange={setZoomLevel} />;
  };

  return <ControlsWrapper>{renderZoomControls()}</ControlsWrapper>;
};

export default Controls;
