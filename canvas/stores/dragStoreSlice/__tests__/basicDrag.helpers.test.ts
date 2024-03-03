import {
  DROP_DIRECTION,
  NODE_TYPES,
  PLACEHOLDER_NODES,
  UTILITY_NODES,
} from '../../../Canvas.enums';
import type { CanvasGraph } from '../../../Canvas.types';
import { cloneNodes } from '../../../helpers/generalHelpers';
import { createNewNode } from '../../../helpers/nodeCreation';
import { getNodeBranches } from '../../../helpers/nodeNavigation';
import { getConsolidatedNodesInfo } from '../../nodeStoreSlice/nodeStoreSlice.helpers';
import { performDropOnBasicNodes } from '../basicDrag.helpers';

describe('basicDrag.helpers', () => {
  const workflowGraph: CanvasGraph = {
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

  describe('dragging onto a basic node', () => {
    it.each([
      ['B', 'A'],
      ['C', 'B'],
    ])(
      'should be a noop if a node %s is dragged on the bottom of its parent',
      (sourceNodeId, targetNodeId) => {
        const originalGraph: CanvasGraph = {
          rootNode: 'A',
          edges: {
            A: ['B'],
            B: ['C'],
          },
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
        };
        const graph = cloneNodes(originalGraph);

        const actual = performDropOnBasicNodes({
          dropDirection: DROP_DIRECTION.BOTTOM,
          nodes: graph,
          nodesInfo: getConsolidatedNodesInfo(graph),
          sourceNodeId,
          targetNodeId,
        });

        expect(actual.nodes.nodes).toEqual(originalGraph.nodes);
        expect(actual.nodes.edges).toEqual(originalGraph.edges);
      }
    );

    it.each([
      // true branch of if/else B
      ['I', 'D', 'B', DROP_DIRECTION.BOTTOM],
      ['D', 'I', 'B', DROP_DIRECTION.TOP],
    ])(
      'should swap the position of two basic nodes in a branch of an if/else node',
      (sourceNodeId, targetNodeId, parentBlockId, dropDirection) => {
        const graph = cloneNodes(workflowGraph);
        const nodesInfo = getConsolidatedNodesInfo(graph);

        // true branch of if_else b
        const originalBranches = getNodeBranches(graph, parentBlockId);
        expect(originalBranches).toEqual([['I', 'D', 'J'], []]);

        const actual = performDropOnBasicNodes({
          dropDirection,
          nodes: graph,
          nodesInfo,
          sourceNodeId,
          targetNodeId,
        });

        const branches = getNodeBranches(actual.nodes, parentBlockId);
        expect(branches).toEqual([['D', 'I', 'J'], []]);
      }
    );

    it('should remove the node from an if/else block if it is dragged above the block', () => {
      const graph = cloneNodes(workflowGraph);
      const nodesInfo = getConsolidatedNodesInfo(graph);

      // true branch of if_else b
      const originalBranches = getNodeBranches(graph, 'B');
      expect(originalBranches).toEqual([['I', 'D', 'J'], []]);

      const actual = performDropOnBasicNodes({
        dropDirection: DROP_DIRECTION.BOTTOM,
        nodes: graph,
        nodesInfo,
        sourceNodeId: 'I',
        targetNodeId: 'A',
      });

      const branches = getNodeBranches(actual.nodes, 'B');
      expect(branches).toEqual([['D', 'J'], []]);

      expect(actual.nodes.nodes.B).toEqual({
        type: 'IF_ELSE',
        trueNode: 'D',
        falseNode: null,
      });
      expect(actual.nodes.edges.A).toEqual(['I']);
      expect(actual.nodes.edges.I).toEqual(['B']);
    });

    it('should insert a new node after a basic node', () => {
      const graph = cloneNodes(workflowGraph);

      const newNode = createNewNode(NODE_TYPES.DEFAULT);
      graph.nodes[newNode.id] = newNode;

      const actual = performDropOnBasicNodes({
        newNode,
        dropDirection: DROP_DIRECTION.BOTTOM,
        nodes: graph,
        nodesInfo: getConsolidatedNodesInfo(graph),
        sourceNodeId: newNode.id,
        targetNodeId: 'A',
      });

      expect(actual.nodes.edges.A).toEqual([newNode.id]);
      expect(actual.nodes.edges[newNode.id]).toEqual(['B']);
    });

    it('should create a DO_IN_PARALLEL node if a node is added to the side of a basic node', () => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        edges: {
          A: ['B'],
        },
        nodes: {
          A: {
            type: NODE_TYPES.DEFAULT,
          },
          B: {
            type: NODE_TYPES.DEFAULT,
          },
        },
      };
      const newNode = createNewNode(NODE_TYPES.DEFAULT);
      graph.nodes[newNode.id] = newNode;

      const actual = performDropOnBasicNodes({
        newNode,
        dropDirection: DROP_DIRECTION.LEFT,
        nodes: graph,
        nodesInfo: getConsolidatedNodesInfo(graph),
        sourceNodeId: newNode.id,
        targetNodeId: 'B',
      });

      expect(actual.nodes.edges.A).toEqual([newNode.id, 'B']);
      expect(actual.nodes.edges).not.toContain('B');
    });

    it.each([
      ['IF_C', 'B', DROP_DIRECTION.TOP],
      ['B', 'IF_C', DROP_DIRECTION.BOTTOM],
    ])(
      'should move the entire block above a basic node if the block is dragged above it',
      (sourceNodeId, targetNodeId, dropDirection) => {
        const graph: CanvasGraph = {
          rootNode: 'A',
          edges: {
            A: ['B'],
            B: ['IF_C'],
            IF_C: ['D'],
            D: ['F'],
          },
          nodes: {
            A: {
              type: NODE_TYPES.DEFAULT,
            },
            B: {
              type: NODE_TYPES.DEFAULT,
            },
            IF_C: {
              type: NODE_TYPES.IF_ELSE,
              trueNode: 'E',
              falseNode: null,
            },
            D: {
              type: NODE_TYPES.DEFAULT,
            },
            E: {
              type: NODE_TYPES.DEFAULT,
            },
            F: {
              type: NODE_TYPES.DEFAULT,
            },
          },
        };

        const original = cloneNodes(graph);

        const actual = performDropOnBasicNodes({
          dropDirection,
          nodes: graph,
          nodesInfo: getConsolidatedNodesInfo(graph),
          sourceNodeId,
          targetNodeId,
        });

        expect(actual.nodes.nodes).toEqual(original.nodes);
        expect(actual.nodes.edges).toEqual({
          A: ['IF_C'],
          IF_C: ['B'],
          B: ['D'],
          D: ['F'],
        });
      }
    );
  });

  describe('dragging onto a ONCE_ALL_COMPLETED node', () => {
    const originalGraph: CanvasGraph = {
      rootNode: 'A',
      nodes: {
        A: { type: NODE_TYPES.DEFAULT },
        DO_IN_PARALLEL_6acc: {
          id: 'DO_IN_PARALLEL_6acc',
          type: NODE_TYPES.DO_IN_PARALLEL,
          nodes: ['DROP_TARGET_PLACEHOLDER_ea9c', 'DEFAULT_7916'],
        },
        DEFAULT_7916: {
          id: 'DEFAULT_7916',
          type: NODE_TYPES.DEFAULT,
        },
        DROP_TARGET_PLACEHOLDER_ea9c: {
          id: 'DROP_TARGET_PLACEHOLDER_ea9c',
          type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER,
        },
        ONCE_ALL_COMPLETED_7fd2: {
          id: 'ONCE_ALL_COMPLETED_7fd2',
          type: UTILITY_NODES.ONCE_ALL_COMPLETED,
        },
        DEFAULT_5b83: {
          id: 'DEFAULT_5b83',
          type: NODE_TYPES.DEFAULT,
        },
      },
      edges: {
        A: ['DO_IN_PARALLEL_6acc'],
        DO_IN_PARALLEL_6acc: ['ONCE_ALL_COMPLETED_7fd2'],
        ONCE_ALL_COMPLETED_7fd2: ['DEFAULT_5b83'],
      },
    };

    it('should add a new node after the ONCE_ALL_COMPLETED node', () => {
      const graphWithParallelNodes = cloneNodes(originalGraph);

      const newNode = createNewNode(NODE_TYPES.DEFAULT);
      graphWithParallelNodes.nodes[newNode.id] = newNode;

      const actual = performDropOnBasicNodes({
        dropDirection: DROP_DIRECTION.BOTTOM,
        nodes: graphWithParallelNodes,
        nodesInfo: getConsolidatedNodesInfo(graphWithParallelNodes),
        sourceNodeId: newNode.id,
        targetNodeId: 'ONCE_ALL_COMPLETED_7fd2',
      });

      expect(actual.nodes).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          DEFAULT_7916: {
            id: 'DEFAULT_7916',
            type: NODE_TYPES.DEFAULT,
          },
          DO_IN_PARALLEL_6acc: {
            id: 'DO_IN_PARALLEL_6acc',
            type: NODE_TYPES.DO_IN_PARALLEL,
            nodes: [null, 'DEFAULT_7916'],
          },
          DEFAULT_5b83: {
            id: 'DEFAULT_5b83',
            type: NODE_TYPES.DEFAULT,
          },
          [newNode.id]: newNode,
        },
        edges: {
          A: ['DO_IN_PARALLEL_6acc'],
          DO_IN_PARALLEL_6acc: [newNode.id],
          [newNode.id]: ['DEFAULT_5b83'],
        },
      });
    });

    it('should handle moving a node out of a DO_IN_PARALLEL block', () => {
      const graphWithParallelNodes = cloneNodes(originalGraph);
      const actual = performDropOnBasicNodes({
        dropDirection: DROP_DIRECTION.BOTTOM,
        nodes: graphWithParallelNodes,
        nodesInfo: getConsolidatedNodesInfo(graphWithParallelNodes),
        sourceNodeId: 'DEFAULT_7916',
        targetNodeId: 'ONCE_ALL_COMPLETED_7fd2',
      });

      expect(actual.nodes.nodes).toEqual({
        A: { type: NODE_TYPES.DEFAULT },
        DEFAULT_7916: {
          id: 'DEFAULT_7916',
          type: NODE_TYPES.DEFAULT,
        },
        DO_IN_PARALLEL_6acc: {
          id: 'DO_IN_PARALLEL_6acc',
          type: NODE_TYPES.DO_IN_PARALLEL,
          nodes: [null, null],
        },
        DEFAULT_5b83: {
          id: 'DEFAULT_5b83',
          type: NODE_TYPES.DEFAULT,
        },
      });
      expect(actual.nodes.edges).toEqual({
        A: ['DO_IN_PARALLEL_6acc'],
        DO_IN_PARALLEL_6acc: ['DEFAULT_7916'],
        DEFAULT_7916: ['DEFAULT_5b83'],
      });
    });
  });
});
