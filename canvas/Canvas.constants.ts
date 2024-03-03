export const DEFAULT_NODE_DIMENSIONS = {
  width: 250,
  height: 75,
};

export const NODE_SPACING = {
  horizontal: 100,
  vertical: 50,
};

export const EMPTY_DRAG_PLACEHOLDER_DIMENSIONS = {
  width: 300,
  height: 150,
};

export const CANVAS_TRANSLATION_KEYS = {
  NAMESPACE: 'hubPlatform',
  PREFIX: 'canvas',
  END: 'end',
  ONCE_ALL_COMPLETED: 'onceAllCompleted',
  DO_IN_PARALLEL: 'doInParallel',
  AFTER_LAST: 'afterLast',
  ZOOM_IN_TIP: 'zoomInTip',
  ZOOM_OUT_TIP: 'zoomOutTip',
} as const;

export const NODE_DATA_TRANSFER_KEY = 'CANVAS_NODE_DATA';
