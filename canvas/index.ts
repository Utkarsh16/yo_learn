// TODO: remove this default export
export { default } from './canvasContainer';

export { default as Canvas } from './canvasContainer';
export { NODE_TYPES } from './Canvas.enums';
export { NODE_DATA_TRANSFER_KEY } from './Canvas.constants';
export type { CanvasGraph, Node } from './Canvas.types';

// export some convenient utility functions
export { deleteNode } from './stores/dragStoreSlice/nodes.helpers';
