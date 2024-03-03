import { NODE_TYPES, PLACEHOLDER_NODES } from '../../Canvas.enums';
import type { CanvasGraph } from '../../Canvas.types';
import {
  buildParentMap,
  getBlockChildren,
  getNodeBranches,
  getNodeChildren,
} from '../nodeNavigation';

describe('nodeNavigation', () => {
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
  const graphWithNullIfBranch: CanvasGraph = {
    rootNode: 'A',
    nodes: {
      A: {
        type: NODE_TYPES.DEFAULT,
        // children: [b],
      },
      B: {
        type: NODE_TYPES.IF_ELSE,
        // children: [i, g],
        trueNode: 'I',
        falseNode: null,
      },
      I: {
        type: NODE_TYPES.DEFAULT,
        // children: [d],
      },
      J: {
        type: NODE_TYPES.FOR_EACH,
        // children: [e],
        body: 'E',
      },
      G: {
        type: NODE_TYPES.DEFAULT,
        // children: [],
      },
      C: {
        type: NODE_TYPES.IF_ELSE,
        // children: [g],
        trueNode: null,
        falseNode: null,
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

  const preprocessedGraph: CanvasGraph = {
    rootNode: 'A',
    nodes: {
      A: { type: NODE_TYPES.DEFAULT },
      B: {
        type: NODE_TYPES.IF_ELSE,
        trueNode: 'I',
        falseNode: 'DROP_TARGET_PLACEHOLDER_75da',
      },
      I: { type: NODE_TYPES.DEFAULT },
      J: { type: NODE_TYPES.FOR_EACH, body: 'E' },
      G: { type: NODE_TYPES.DEFAULT },
      C: {
        type: NODE_TYPES.IF_ELSE,
        trueNode: 'DROP_TARGET_PLACEHOLDER_aaae',
        falseNode: 'DROP_TARGET_PLACEHOLDER_a31b',
      },
      D: { type: NODE_TYPES.DEFAULT },
      E: { type: NODE_TYPES.DEFAULT },
      DROP_TARGET_PLACEHOLDER_75da: {
        id: 'DROP_TARGET_PLACEHOLDER_75da',
        type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
      },
      DROP_TARGET_PLACEHOLDER_aaae: {
        id: 'DROP_TARGET_PLACEHOLDER_aaae',
        type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
      },
      DROP_TARGET_PLACEHOLDER_a31b: {
        id: 'DROP_TARGET_PLACEHOLDER_a31b',
        type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
      },
      DROP_TARGET_PLACEHOLDER_d551: {
        id: 'DROP_TARGET_PLACEHOLDER_d551',
        type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
      },
      DROP_TARGET_PLACEHOLDER_5d88: {
        id: 'DROP_TARGET_PLACEHOLDER_5d88',
        type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
      },
      DROP_TARGET_PLACEHOLDER_c6f0: {
        id: 'DROP_TARGET_PLACEHOLDER_c6f0',
        type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
      },
    },
    edges: {
      A: ['B'],
      B: ['DROP_TARGET_PLACEHOLDER_d551'],
      I: ['D'],
      D: ['J'],
      E: ['C'],
      DROP_TARGET_PLACEHOLDER_aaae: [],
      DROP_TARGET_PLACEHOLDER_a31b: [],
      DROP_TARGET_PLACEHOLDER_d551: ['G'],
      DROP_TARGET_PLACEHOLDER_5d88: [],
      J: ['DROP_TARGET_PLACEHOLDER_5d88'],
      DROP_TARGET_PLACEHOLDER_c6f0: [],
      C: ['DROP_TARGET_PLACEHOLDER_c6f0'],
    },
  };

  describe('buildParentMap', () => {
    it('should build a map of child -> parent relationships', () => {
      const map = buildParentMap(preprocessedGraph);
      expect(map).toEqual({
        B: ['A'],
        I: ['B'],
        DROP_TARGET_PLACEHOLDER_75da: ['B'],
        DROP_TARGET_PLACEHOLDER_d551: ['B'],
        D: ['I'],
        E: ['J'],
        DROP_TARGET_PLACEHOLDER_5d88: ['J'],
        DROP_TARGET_PLACEHOLDER_aaae: ['C'],
        DROP_TARGET_PLACEHOLDER_a31b: ['C'],
        DROP_TARGET_PLACEHOLDER_c6f0: ['C'],
        J: ['D'],
        C: ['E'],
        G: ['DROP_TARGET_PLACEHOLDER_d551'],
      });
    });
  });

  describe('getNodeChildren', () => {
    it.each([
      ['A', ['IF_B']],
      ['I', ['FOR_J']],
    ])('should return the children of a default node %s', (node, children) => {
      expect(getNodeChildren(graph, node)).toEqual(children);
    });

    it.each([
      ['H', ['G']],
      ['IF_C', ['G']],
      ['FOR_J', ['IF_C']],
    ])(
      'should return the child of the highest control flow parent of a node if that node has no child node',
      (nodeId, expected) => {
        expect(getNodeChildren(graph, nodeId)).toEqual(expected);
      }
    );

    it('should return the children of an if/else node', () => {
      expect(getNodeChildren(graph, 'IF_B')).toEqual(['I', 'H']);
    });

    it('should return the children of a for loop node', () => {
      expect(getNodeChildren(graph, 'FOR_J')).toEqual(['IF_C']);
    });

    it('should return an empty array if there are no children', () => {
      expect(getNodeChildren(graph, 'G')).toEqual([]);
    });

    it('should return the child of the highest control flow parent node if one of the branches of an if/else node is null', () => {
      const children = getNodeChildren(graphWithNullIfBranch, 'B');
      expect(children).toEqual(['I', 'G']);
    });

    describe('On a preprocessed graph with placeholder nodes', () => {
      it('should return an empty array if there are no children', () => {
        expect(getNodeChildren(preprocessedGraph, 'G')).toEqual([]);
      });

      it.each([
        ['C', ['DROP_TARGET_PLACEHOLDER_aaae', 'DROP_TARGET_PLACEHOLDER_a31b']],
        ['B', ['I', 'DROP_TARGET_PLACEHOLDER_75da']],
      ])(
        'should return the children of an if/else block %s',
        (node, expected) => {
          expect(getNodeChildren(preprocessedGraph, node)).toEqual(expected);
        }
      );

      it.each([
        // child of B
        ['DROP_TARGET_PLACEHOLDER_75da', ['DROP_TARGET_PLACEHOLDER_d551']],
        // both branches of C point to the same child placeholder node
        ['DROP_TARGET_PLACEHOLDER_aaae', ['DROP_TARGET_PLACEHOLDER_c6f0']],
        ['DROP_TARGET_PLACEHOLDER_a31b', ['DROP_TARGET_PLACEHOLDER_c6f0']],
      ])(
        'should return the children of a placeholder node %s of an if/else block',
        (node, expected) => {
          expect(getNodeChildren(preprocessedGraph, node)).toEqual(expected);
        }
      );

      it.each([
        ['DROP_TARGET_PLACEHOLDER_c6f0', ['DROP_TARGET_PLACEHOLDER_5d88']],
        ['DROP_TARGET_PLACEHOLDER_5d88', ['DROP_TARGET_PLACEHOLDER_d551']],
        ['DROP_TARGET_PLACEHOLDER_d551', ['G']],
      ])(
        'should return the child of the parent block for the leaves of the subgraph of %s',
        (node, expected) => {
          expect(getNodeChildren(preprocessedGraph, node)).toEqual(expected);
        }
      );
    });
  });

  describe('getBlockChildren', () => {
    it.each([
      ['IF_B', ['G']],
      ['IF_C', ['G']],
      ['FOR_J', ['G']],
    ])(
      'should return the child of the highest control flow parent of a node if that node has no child node',
      () => {
        expect(getBlockChildren(graph, 'H')).toEqual(['G']);
      }
    );

    it.each([
      ['C', ['DROP_TARGET_PLACEHOLDER_c6f0']],
      ['B', ['DROP_TARGET_PLACEHOLDER_d551']],
      ['J', ['DROP_TARGET_PLACEHOLDER_5d88']],
    ])(
      'should return the next node after all the block %s nodes have completed',
      (node, expected) => {
        expect(getBlockChildren(preprocessedGraph, node)).toEqual(expected);
      }
    );
  });

  describe('getNodeBranches', () => {
    it('should return the branches of an if/else node', () => {
      const branches = getNodeBranches(graph, 'IF_B');
      expect(branches).toEqual([['I', 'FOR_J'], ['H']]);
    });

    it('should not traverse control flow nodes as part of a branch', () => {
      const branches = getNodeBranches(graphWithNullIfBranch, 'B');
      expect(branches).toEqual([['I', 'D', 'J'], []]);
    });

    it('should return the branches of a DO_IN_PARALLEL node with placeholders', () => {
      const doInParallelGraph: CanvasGraph = {
        edges: {
          A: ['DO_IN_PARALLEL_1'],
          DO_IN_PARALLEL_1: [],
          DROP_TARGET_PLACEHOLDER_1: [],
          DROP_TARGET_PLACEHOLDER_2: [],
        },
        nodes: {
          A: {
            type: NODE_TYPES.DEFAULT,
          },
          DO_IN_PARALLEL_1: {
            id: 'DO_IN_PARALLEL_1',
            nodes: ['DROP_TARGET_PLACEHOLDER_1', 'DROP_TARGET_PLACEHOLDER_2'],
            type: NODE_TYPES.DO_IN_PARALLEL,
          },
          DROP_TARGET_PLACEHOLDER_1: {
            id: 'DROP_TARGET_PLACEHOLDER_1',
            type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
          },
          DROP_TARGET_PLACEHOLDER_2: {
            id: 'DROP_TARGET_PLACEHOLDER_2',
            type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
          },
        },
        rootNode: 'A',
      };

      const branches = getNodeBranches(doInParallelGraph, 'DO_IN_PARALLEL_1');
      expect(branches).toEqual([
        ['DROP_TARGET_PLACEHOLDER_1'],
        ['DROP_TARGET_PLACEHOLDER_2'],
      ]);
    });

    describe('On a preprocessed graph with placeholder nodes', () => {
      it.each([
        [
          'B',
          [
            ['I', 'D', 'J', 'DROP_TARGET_PLACEHOLDER_5d88'],
            ['DROP_TARGET_PLACEHOLDER_75da'],
          ],
        ],
        [
          'C',
          [['DROP_TARGET_PLACEHOLDER_aaae'], ['DROP_TARGET_PLACEHOLDER_a31b']],
        ],
      ])(
        'should return the branches of an if/else node %s',
        (node, expected) => {
          expect(getNodeBranches(preprocessedGraph, node)).toEqual(expected);
        }
      );

      it.each([['J', [['E', 'C', 'DROP_TARGET_PLACEHOLDER_c6f0']]]])(
        'should return the branch of a for node %s',
        (node, expected) => {
          expect(getNodeBranches(preprocessedGraph, node)).toEqual(expected);
        }
      );
    });
  });
});
