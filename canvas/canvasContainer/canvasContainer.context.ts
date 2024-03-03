import { createContext, useContext } from 'react';

export type CanvasPropsContextValue = {
  onNodeSelected: ((nodeId: string | null) => void) | undefined;
};

export const CanvasPropsContext = createContext<CanvasPropsContextValue>({
  onNodeSelected: undefined,
});

export function useCanvasPropsContext() {
  return useContext(CanvasPropsContext);
}
