import { NODE_TYPES } from '../../Canvas.enums';
import type { CanvasGraph } from '../../Canvas.types';
import { preProcessNodes } from '../../stores/nodeStoreSlice/nodeStoreSlice.helpers';
import { cloneNodes } from '../generalHelpers';
import { sanitizeBlocksAndNodes } from '../nodeProcessors';

describe('nodeProcessors', () => {
  describe('sanitizeBlocksAndNodes', () => {
    const graphWithBlockNodes: CanvasGraph = {
      rootNode: 'A',
      nodes: {
        A: {
          type: NODE_TYPES.DEFAULT,
        },
        B: {
          type: NODE_TYPES.IF_ELSE,
          trueNode: 'I',
          falseNode: null,
        },
        I: {
          type: NODE_TYPES.DEFAULT,
        },
        J: {
          type: NODE_TYPES.FOR_EACH,
          body: 'E',
        },
        G: {
          type: NODE_TYPES.DEFAULT,
        },
        C: {
          type: NODE_TYPES.IF_ELSE,
          trueNode: null,
          falseNode: null,
        },
        D: {
          type: NODE_TYPES.DEFAULT,
        },
        E: {
          type: NODE_TYPES.DEFAULT,
        },
      },
      edges: {
        A: ['B'],
        B: ['G'],
        I: ['D'],
        D: ['J'],
        E: ['C'],
      },
    };

    it('should reverse the output of preprocessNodes', () => {
      const clone = cloneNodes(graphWithBlockNodes);
      expect(clone).toEqual(graphWithBlockNodes);

      const preprocessed = preProcessNodes(clone);
      expect(preprocessed).not.toEqual(graphWithBlockNodes);

      const sanitized = sanitizeBlocksAndNodes(preprocessed);
      expect(sanitized).toEqual({ nodes: graphWithBlockNodes });
    });
  });
});
