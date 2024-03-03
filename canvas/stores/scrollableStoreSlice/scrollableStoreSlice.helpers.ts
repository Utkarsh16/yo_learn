import { SCROLLABLE_CONSTANTS } from './scrollableStoreSlice.constants';

export const clampZoom = (zoomLevel: number) =>
  Math.min(
    Math.max(zoomLevel, SCROLLABLE_CONSTANTS.zoomOutLimit),
    SCROLLABLE_CONSTANTS.zoomInLimit
  );
