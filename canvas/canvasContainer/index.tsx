import React, { Suspense } from 'react';
import Spinner from '@rippling/ui/Spinner';
import type { CanvasProps } from '../Canvas.types';

const CanvasContainer = React.lazy(
  () =>
    import(
      /* webpackChunkName: "rippling-hub_platform-canvas-component" */ './CanvasContainer'
    )
);

const CanvasSuspense = (props: CanvasProps) => {
  return (
    <Suspense fallback={<Spinner.SettingsLoader />}>
      <CanvasContainer {...props} />
    </Suspense>
  );
};

export default CanvasSuspense;
