import * as uuid from 'uuid';
import { NODE_TYPES } from '../../../Canvas.enums';
import type { CanvasGraph } from '../../../Canvas.types';
import { cloneNodes } from '../../../helpers/generalHelpers';
import {
  addPlaceholderNodesForWholeBlock,
  preProcessNodes,
} from '../nodeStoreSlice.helpers';

jest.mock('uuid', () => {
  const originalModule = jest.requireActual('uuid');
  return {
    ...originalModule,
    v4: jest.fn(),
  };
});

describe('nodeStoreSlice', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    const uuidV4Mock = uuid.v4 as jest.Mock;

    let i = 0;
    uuidV4Mock.mockImplementation(() => {
      i += 1;
      return i;
    });
  });

  const graph: CanvasGraph = {
    rootNode: 'A',
    nodes: {
      A: {
        type: NODE_TYPES.DEFAULT,
      },
      IF_B: {
        type: NODE_TYPES.IF_ELSE,
        trueNode: 'I',
        falseNode: 'H',
      },
      IF_C: {
        type: NODE_TYPES.IF_ELSE,
        trueNode: null,
        falseNode: null,
      },
      G: {
        type: NODE_TYPES.DEFAULT,
      },
      H: {
        type: NODE_TYPES.DEFAULT,
      },
      I: {
        type: NODE_TYPES.DEFAULT,
      },
      FOR_J: {
        type: NODE_TYPES.FOR_EACH,
        body: 'IF_C',
      },
    },
    edges: {
      A: ['IF_B'],
      IF_B: ['G'],
      I: ['FOR_J'],
    },
  };
  describe('preProcessNodes', () => {
    it('should insert placeholder nodes into a graph with several block nodes', () => {
      const graphWithBlockNodes: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: {
            type: NODE_TYPES.DEFAULT,
            // children: [b],
          },
          B: {
            type: NODE_TYPES.IF_ELSE,
            trueNode: 'I',
            falseNode: null,
            // children: [i, g],
          },
          I: {
            type: NODE_TYPES.DEFAULT,
            // children: [d],
          },
          J: {
            type: NODE_TYPES.FOR_EACH,
            body: 'E',
            // children: [e],
          },
          G: {
            type: NODE_TYPES.DEFAULT,
            // children: [],
          },
          C: {
            type: NODE_TYPES.IF_ELSE,
            trueNode: null,
            falseNode: null,
            // children: [g],
          },
          D: {
            type: NODE_TYPES.DEFAULT,
            // children: [j],
          },
          E: {
            type: NODE_TYPES.DEFAULT,
            // children: [c],
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
      const preprocessed = preProcessNodes(graphWithBlockNodes);
      expect(preprocessed).toEqual({
        edges: {
          A: ['B'],
          B: ['DROP_TARGET_PLACEHOLDER_4'],
          C: ['DROP_TARGET_PLACEHOLDER_6'],
          D: ['J'],
          DROP_TARGET_PLACEHOLDER_4: ['G'],
          DROP_TARGET_PLACEHOLDER_5: [],
          DROP_TARGET_PLACEHOLDER_6: [],
          E: ['C'],
          I: ['D'],
          J: ['DROP_TARGET_PLACEHOLDER_5'],
        },
        nodes: {
          A: {
            type: 'DEFAULT',
          },
          B: {
            falseNode: 'DROP_TARGET_PLACEHOLDER_1',
            trueNode: 'I',
            type: 'IF_ELSE',
          },
          C: {
            falseNode: 'DROP_TARGET_PLACEHOLDER_3',
            trueNode: 'DROP_TARGET_PLACEHOLDER_2',
            type: 'IF_ELSE',
          },
          D: {
            type: 'DEFAULT',
          },
          DROP_TARGET_PLACEHOLDER_1: {
            id: 'DROP_TARGET_PLACEHOLDER_1',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_2: {
            id: 'DROP_TARGET_PLACEHOLDER_2',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_3: {
            id: 'DROP_TARGET_PLACEHOLDER_3',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_4: {
            id: 'DROP_TARGET_PLACEHOLDER_4',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_5: {
            id: 'DROP_TARGET_PLACEHOLDER_5',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_6: {
            id: 'DROP_TARGET_PLACEHOLDER_6',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          E: {
            type: 'DEFAULT',
          },
          G: {
            type: 'DEFAULT',
          },
          I: {
            type: 'DEFAULT',
          },
          J: {
            body: 'E',
            type: 'FOR_EACH',
          },
        },
        rootNode: 'A',
      } as CanvasGraph);
    });

    it('should insert placeholder nodes', () => {
      const preprocessed = preProcessNodes(cloneNodes(graph));

      expect(preprocessed).toEqual({
        edges: {
          A: ['IF_B'],
          I: ['FOR_J'],
          IF_B: ['DROP_TARGET_PLACEHOLDER_3'],
          IF_C: ['DROP_TARGET_PLACEHOLDER_4'],
          DROP_TARGET_PLACEHOLDER_3: ['G'],
          DROP_TARGET_PLACEHOLDER_4: [],
          DROP_TARGET_PLACEHOLDER_5: [],
          FOR_J: ['DROP_TARGET_PLACEHOLDER_5'],
        },
        nodes: {
          A: {
            type: 'DEFAULT',
          },
          FOR_J: {
            body: 'IF_C',
            type: 'FOR_EACH',
          },
          G: {
            type: 'DEFAULT',
          },
          H: {
            type: 'DEFAULT',
          },
          I: {
            type: 'DEFAULT',
          },
          IF_B: {
            falseNode: 'H',
            trueNode: 'I',
            type: 'IF_ELSE',
          },
          IF_C: {
            falseNode: 'DROP_TARGET_PLACEHOLDER_2',
            trueNode: 'DROP_TARGET_PLACEHOLDER_1',
            type: 'IF_ELSE',
          },
          DROP_TARGET_PLACEHOLDER_1: {
            id: 'DROP_TARGET_PLACEHOLDER_1',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_2: {
            id: 'DROP_TARGET_PLACEHOLDER_2',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_3: {
            id: 'DROP_TARGET_PLACEHOLDER_3',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_4: {
            id: 'DROP_TARGET_PLACEHOLDER_4',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_5: {
            id: 'DROP_TARGET_PLACEHOLDER_5',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
        },
        rootNode: 'A',
      } as CanvasGraph);
    });

    it('should insert ONCE_ALL_COMPLETED nodes if there are multiple children of a parent', () => {
      const basicGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: {
            type: NODE_TYPES.DEFAULT,
          },
          B: {
            type: NODE_TYPES.DEFAULT,
          },
          C: {
            type: NODE_TYPES.DEFAULT,
          },
        },
        edges: {
          A: ['B', 'C'],
        },
      };

      const preprocessed = preProcessNodes(cloneNodes(basicGraph));
      expect(preprocessed).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: 'DEFAULT' },
          B: { type: 'DEFAULT' },
          C: { type: 'DEFAULT' },
          ONCE_ALL_COMPLETED_1: {
            id: 'ONCE_ALL_COMPLETED_1',
            type: 'ONCE_ALL_COMPLETED',
          },
        },
        edges: {
          A: ['B', 'C'],
          ONCE_ALL_COMPLETED_1: [],
          B: ['ONCE_ALL_COMPLETED_1'],
          C: ['ONCE_ALL_COMPLETED_1'],
        },
      });
    });
  });

  describe('addPlaceholderNodesForWholeBlock', () => {
    it('should insert placeholders for an IF_ELSE node', () => {
      const ifElseGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          IF_ELSE_1: {
            type: NODE_TYPES.IF_ELSE,
            trueNode: null,
            falseNode: null,
          },
        },
        edges: {
          A: ['IF_ELSE_1'],
          IF_ELSE_1: [],
        },
      };

      addPlaceholderNodesForWholeBlock(ifElseGraph, 'IF_ELSE_1');

      expect(ifElseGraph).toEqual({
        edges: {
          A: ['IF_ELSE_1'],
          IF_ELSE_1: [],
        },
        nodes: {
          A: {
            type: 'DEFAULT',
          },
          DROP_TARGET_PLACEHOLDER_1: {
            id: 'DROP_TARGET_PLACEHOLDER_1',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_2: {
            id: 'DROP_TARGET_PLACEHOLDER_2',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          IF_ELSE_1: {
            falseNode: 'DROP_TARGET_PLACEHOLDER_2',
            trueNode: 'DROP_TARGET_PLACEHOLDER_1',
            type: 'IF_ELSE',
          },
        },
        rootNode: 'A',
      });
    });

    it('should insert placeholders for a FOR_EACH node', () => {
      const forEachGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          FOR_EACH_1: {
            type: NODE_TYPES.FOR_EACH,
            body: null,
          },
        },
        edges: {
          A: ['FOR_EACH_1'],
          FOR_EACH_1: [],
        },
      };

      addPlaceholderNodesForWholeBlock(forEachGraph, 'FOR_EACH_1');

      expect(forEachGraph).toEqual({
        edges: {
          A: ['FOR_EACH_1'],
          FOR_EACH_1: [],
        },
        nodes: {
          A: {
            type: 'DEFAULT',
          },
          DROP_TARGET_PLACEHOLDER_1: {
            id: 'DROP_TARGET_PLACEHOLDER_1',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          FOR_EACH_1: {
            type: 'FOR_EACH',
            body: 'DROP_TARGET_PLACEHOLDER_1',
          },
        },
        rootNode: 'A',
      });
    });

    it('should insert placeholders for a DO_IN_PARALLEL node', () => {
      const doInParallelGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          DO_IN_PARALLEL_1: {
            id: 'DO_IN_PARALLEL_1',
            type: NODE_TYPES.DO_IN_PARALLEL,
            nodes: [],
          },
        },
        edges: {
          A: ['DO_IN_PARALLEL_1'],
          DO_IN_PARALLEL_1: [],
        },
      };

      addPlaceholderNodesForWholeBlock(doInParallelGraph, 'DO_IN_PARALLEL_1');

      expect(doInParallelGraph).toEqual({
        edges: {
          A: ['DO_IN_PARALLEL_1'],
          DO_IN_PARALLEL_1: [],
          DROP_TARGET_PLACEHOLDER_1: [],
          DROP_TARGET_PLACEHOLDER_2: [],
        },
        nodes: {
          A: {
            type: 'DEFAULT',
          },
          DO_IN_PARALLEL_1: {
            id: 'DO_IN_PARALLEL_1',
            nodes: ['DROP_TARGET_PLACEHOLDER_1', 'DROP_TARGET_PLACEHOLDER_2'],
            type: 'DO_IN_PARALLEL',
          },
          DROP_TARGET_PLACEHOLDER_1: {
            id: 'DROP_TARGET_PLACEHOLDER_1',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
          DROP_TARGET_PLACEHOLDER_2: {
            id: 'DROP_TARGET_PLACEHOLDER_2',
            type: 'DROP_TARGET_PLACEHOLDER',
          },
        },
        rootNode: 'A',
      });
    });
  });
});
