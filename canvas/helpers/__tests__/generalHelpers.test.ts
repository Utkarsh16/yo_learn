import { NODE_TYPES } from '../../Canvas.enums';
import type { CanvasGraph } from '../../Canvas.types';
import { cloneNodes } from '../generalHelpers';

jest.mock('uuid', () => {
  const originalModule = jest.requireActual('uuid');
  let id = 0;

  return {
    ...originalModule,
    v4: () => {
      id += 1;
      return id;
    },
  };
});

describe('generalHelpers', () => {
  describe('cloneNodes', () => {
    it('should clone the graph', () => {
      const simpleGraph: CanvasGraph = {
        rootNode: 'a',
        nodes: {
          a: {
            type: NODE_TYPES.DEFAULT,
          },
          b: {
            type: NODE_TYPES.DEFAULT,
          },
          c: {
            type: NODE_TYPES.DEFAULT,
          },
        },
        edges: {
          a: ['b'],
          b: ['c'],
        },
      };

      const cloned = cloneNodes(simpleGraph);

      expect(simpleGraph.nodes).not.toBe(cloned.nodes);
      expect(simpleGraph.edges).not.toBe(cloned.edges);

      Object.keys(simpleGraph.edges).forEach(edge => {
        expect(simpleGraph.edges[edge]).not.toBe(cloned.edges[edge]);
      });

      expect(simpleGraph).toEqual(cloned);
    });
  });
});
