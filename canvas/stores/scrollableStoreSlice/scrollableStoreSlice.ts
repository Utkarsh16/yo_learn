import type { StateCreator } from 'zustand';
import type { CanvasStore, ScrollableStore } from '../useCanvasStore.types';
import { SCROLLABLE_CONSTANTS } from './scrollableStoreSlice.constants';
import { clampZoom } from './scrollableStoreSlice.helpers';

const scrollableStoreSlice: StateCreator<
  CanvasStore,
  [],
  [],
  ScrollableStore
> = (set, get): ScrollableStore => ({
  zoomLevel: SCROLLABLE_CONSTANTS.defaultZoom,
  offset: SCROLLABLE_CONSTANTS.defaultOffset,

  container: null,

  // callback ref
  containerRef: (el: HTMLElement | null) => {
    set({ container: el });
  },

  center: () => {
    const { container } = get();

    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = rect.width / 2;
    const y = 100;

    set({ offset: { x, y }, zoomLevel: 1 });
  },

  // Zoom buttons callback
  setZoomLevel: (zoomLevel: number) => {
    set({ zoomLevel: clampZoom(Math.round(zoomLevel * 10) / 10) });
  },

  adjustZoomFromScroll: (scrollDeltaY: number) => {
    set(state => ({
      zoomLevel: clampZoom(state.zoomLevel - scrollDeltaY / 500),
    }));
  },

  scrollCanvas: (deltaX: number, deltaY: number) => {
    set(state => ({
      offset: {
        x: state.offset.x - deltaX / 2,
        y: state.offset.y - deltaY / 2,
      },
    }));
  },

  clientToStagePosition: (clientX: number, clientY: number) => {
    const { offset, zoomLevel, container } = get();
    let containerX = 0;
    let containerY = 0;
    if (container) {
      const rect = container.getBoundingClientRect();
      containerX = rect.left;
      containerY = rect.top;
    }
    const zoomMultiple = zoomLevel * zoomLevel;
    const x = (clientX - containerX - offset.x) / zoomMultiple;
    const y = (clientY - containerY - offset.y) / zoomMultiple;
    return { x, y };
  },
});

export default scrollableStoreSlice;
