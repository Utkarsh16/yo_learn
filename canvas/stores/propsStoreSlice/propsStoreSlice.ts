import type { StateCreator } from 'zustand';
import type { CanvasStore, PropsStore } from '../useCanvasStore.types';

const propsStoreSlice: StateCreator<CanvasStore, [], [], PropsStore> = set => ({
  propsInStore: {} as CanvasStore['propsInStore'],
  setPropsInStore: (propsInStore: CanvasStore['propsInStore']) =>
    set({ propsInStore }),
});

export default propsStoreSlice;
