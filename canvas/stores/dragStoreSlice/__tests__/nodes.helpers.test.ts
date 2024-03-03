import * as uuid from 'uuid';
import { NODE_TYPES } from '../../../Canvas.enums';
import type { CanvasGraph } from '../../../Canvas.types';
import { cloneNodes } from '../../../helpers/generalHelpers';
import { createNewNode } from '../../../helpers/nodeCreation';
import { buildParentMap } from '../../../helpers/nodeNavigation';
import {
  deleteNode,
  insertAfter,
  insertBefore,
  insertNodeInBranch,
  removeFromParent,
} from '../nodes.helpers';

jest.mock('uuid', () => {
  const originalModule = jest.requireActual('uuid');
  return {
    ...originalModule,
    v4: jest.fn(),
  };
});

describe('nodes.helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const uuidV4Mock = uuid.v4 as jest.Mock;
    let i = 0;
    uuidV4Mock.mockImplementation(() => {
      i += 1;
      return i;
    });
  });

  const nodeTypes = [
    NODE_TYPES.DEFAULT,
    NODE_TYPES.IF_ELSE,
    NODE_TYPES.FOR_EACH,
    NODE_TYPES.DO_IN_PARALLEL,
  ];

  describe('insertAfter', () => {
    it.each(nodeTypes)(
      'should insert a new %s node after the root node in an otherwise empty graph',
      nodeType => {
        const graph: CanvasGraph = {
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
          },
          edges: {},
        };

        const newNode = createNewNode(nodeType);
        graph.nodes[newNode.id] = newNode;

        insertAfter(graph, 'A', newNode.id);

        expect(graph).toEqual({
          edges: {
            A: [newNode.id],
            [newNode.id]: [],
          },
          nodes: {
            A: {
              type: 'DEFAULT',
            },
            [newNode.id]: newNode,
          },
          rootNode: 'A',
        });
      }
    );

    it.each(nodeTypes)(
      'should insert a new %s node after the root node if there is already a node after it',
      nodeType => {
        const graph: CanvasGraph = {
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: { type: NODE_TYPES.DEFAULT },
          },
          edges: {
            A: ['B'],
          },
        };

        const newNode = createNewNode(nodeType);
        graph.nodes[newNode.id] = newNode;

        insertAfter(graph, 'A', newNode.id);

        expect(graph).toEqual({
          edges: {
            A: [newNode.id],
            [newNode.id]: ['B'],
          },
          nodes: {
            A: {
              type: 'DEFAULT',
            },
            B: {
              type: 'DEFAULT',
            },
            [newNode.id]: newNode,
          },
          rootNode: 'A',
        });
      }
    );

    it.each(nodeTypes)(
      'should insert an existing %s node in a new position after it has been removed from its parent',
      nodeType => {
        const graph: CanvasGraph = {
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: { type: NODE_TYPES.DEFAULT },
          },
          edges: {
            A: ['B'],
          },
        };

        const newNode = createNewNode(nodeType);
        graph.nodes[newNode.id] = newNode;

        // moving a node from (A, newNode, B) -> (A, B, newNode)
        insertAfter(graph, 'A', newNode.id);
        removeFromParent(graph, buildParentMap(graph), newNode.id);

        insertAfter(graph, 'B', newNode.id);

        expect(graph).toEqual({
          edges: {
            A: ['B'],
            B: [newNode.id],
            [newNode.id]: [],
          },
          nodes: {
            A: {
              type: 'DEFAULT',
            },
            B: {
              type: 'DEFAULT',
            },
            [newNode.id]: newNode,
          },
          rootNode: 'A',
        });
      }
    );
  });

  describe('insertBefore', () => {
    it.each(nodeTypes)(
      'should not do anything if trying to insert %s before the root node',
      nodeType => {
        const graph: CanvasGraph = {
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: { type: NODE_TYPES.DEFAULT },
          },
          edges: {
            A: ['B'],
          },
        };

        const childToParentMap = buildParentMap(graph);

        const newNode = createNewNode(nodeType);
        graph.nodes[newNode.id] = newNode;

        insertBefore(graph, childToParentMap, 'A', newNode.id);

        expect(graph.edges).toEqual({
          A: ['B'],
        });
      }
    );

    it.each(nodeTypes)(
      'should insert a new %s node before the given node',
      nodeType => {
        const graph: CanvasGraph = {
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: { type: NODE_TYPES.DEFAULT },
          },
          edges: {
            A: ['B'],
          },
        };

        const newNode = createNewNode(nodeType);
        graph.nodes[newNode.id] = newNode;

        const childToParentMap = buildParentMap(graph);

        insertBefore(graph, childToParentMap, 'B', newNode.id);

        expect(graph).toEqual({
          edges: {
            A: [newNode.id],
            [newNode.id]: ['B'],
          },
          nodes: {
            A: {
              type: 'DEFAULT',
            },
            B: {
              type: 'DEFAULT',
            },
            [newNode.id]: newNode,
          },
          rootNode: 'A',
        });
      }
    );
  });

  describe('insertNodeInBranch', () => {
    describe('DO IN PARALLEL node', () => {
      const originalGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.DO_IN_PARALLEL, nodes: ['C', 'D'] },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['E'],
        },
      };

      it('should insert a new node in the parallel nodes array', () => {
        const graph = cloneNodes(originalGraph);
        const newNode = createNewNode(NODE_TYPES.DEFAULT);
        graph.nodes[newNode.id] = newNode;

        insertNodeInBranch(graph, 'B', 'C', newNode.id);

        expect(graph).toEqual({
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: {
              type: NODE_TYPES.DO_IN_PARALLEL,
              nodes: [newNode.id, 'D'],
            },
            C: { type: NODE_TYPES.DEFAULT },
            D: { type: NODE_TYPES.DEFAULT },
            E: { type: NODE_TYPES.DEFAULT },
            [newNode.id]: newNode,
          },
          edges: {
            ...originalGraph.edges,
            [newNode.id]: ['C'],
          },
        });
      });
    });

    describe('FOR EACH node', () => {
      const originalGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.FOR_EACH, body: 'C' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['D'],
        },
      };

      it('should insert a new node in the for/each body', () => {
        const graph = cloneNodes(originalGraph);
        const newNode = createNewNode(NODE_TYPES.DEFAULT);
        graph.nodes[newNode.id] = newNode;

        insertNodeInBranch(graph, 'B', 'C', newNode.id);

        expect(graph).toEqual({
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: {
              type: NODE_TYPES.FOR_EACH,
              body: newNode.id,
            },
            C: { type: NODE_TYPES.DEFAULT },
            D: { type: NODE_TYPES.DEFAULT },
            [newNode.id]: newNode,
          },
          edges: {
            ...originalGraph.edges,
            [newNode.id]: ['C'],
          },
        });
      });
    });

    describe('IF/ELSE node', () => {
      const originalGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.IF_ELSE, trueNode: 'D', falseNode: 'E' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };
      it('should insert a new node as a true branch', () => {
        const graph = cloneNodes(originalGraph);
        const newNode = createNewNode(NODE_TYPES.DEFAULT);
        graph.nodes[newNode.id] = newNode;

        insertNodeInBranch(graph, 'B', 'D', newNode.id);

        expect(graph).toEqual({
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: {
              type: NODE_TYPES.IF_ELSE,
              trueNode: newNode.id,
              falseNode: 'E',
            },
            C: { type: NODE_TYPES.DEFAULT },
            D: { type: NODE_TYPES.DEFAULT },
            E: { type: NODE_TYPES.DEFAULT },
            [newNode.id]: newNode,
          },
          edges: {
            ...originalGraph.edges,
            [newNode.id]: ['D'],
          },
        });
      });

      it('should insert a new node as a false branch', () => {
        const graph = cloneNodes(originalGraph);
        const newNode = createNewNode(NODE_TYPES.DEFAULT);
        graph.nodes[newNode.id] = newNode;

        insertNodeInBranch(graph, 'B', 'E', newNode.id);

        expect(graph).toEqual({
          rootNode: 'A',
          nodes: {
            A: { type: NODE_TYPES.DEFAULT },
            B: {
              type: NODE_TYPES.IF_ELSE,
              trueNode: 'D',
              falseNode: newNode.id,
            },
            C: { type: NODE_TYPES.DEFAULT },
            D: { type: NODE_TYPES.DEFAULT },
            E: { type: NODE_TYPES.DEFAULT },
            [newNode.id]: newNode,
          },
          edges: {
            ...originalGraph.edges,
            [newNode.id]: ['E'],
          },
        });
      });
    });
  });

  describe('removeFromParent', () => {
    it('should remove a basic node from its parent', () => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.DEFAULT },
          C: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };

      const childToParentMap = buildParentMap(graph);
      removeFromParent(graph, childToParentMap, 'B');

      expect(graph).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.DEFAULT },
          C: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['C'],
        },
      });
    });

    it.each(nodeTypes)('should remove a new node from its parent', nodeType => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.DEFAULT },
          C: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };

      const newNode = createNewNode(nodeType);
      graph.nodes[newNode.id] = newNode;

      insertAfter(graph, 'B', newNode.id);
      // remove the node we just added
      removeFromParent(graph, buildParentMap(graph), newNode.id);

      expect(graph).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.DEFAULT },
          C: { type: NODE_TYPES.DEFAULT },
          [newNode.id]: newNode,
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      });
    });

    it('should remove a block node with children from its parent', () => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.IF_ELSE, trueNode: 'D', falseNode: 'E' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };

      removeFromParent(graph, buildParentMap(graph), 'B');

      expect(graph).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.IF_ELSE, trueNode: 'D', falseNode: 'E' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['C'],
        },
      });
    });

    it('should remove a node from an IF_ELSE node', () => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.IF_ELSE, trueNode: 'D', falseNode: 'E' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };

      const childToParentMap = buildParentMap(graph);
      removeFromParent(graph, childToParentMap, 'D');

      expect(graph).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.IF_ELSE, trueNode: null, falseNode: 'E' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      });
    });

    it('should remove a node from a FOR_EACH node', () => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.FOR_EACH, body: 'D' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };

      const childToParentMap = buildParentMap(graph);
      removeFromParent(graph, childToParentMap, 'D');

      expect(graph).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.FOR_EACH, body: null },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      });
    });

    it('should remove a node from a DO_IN_PARALLEL node', () => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.DO_IN_PARALLEL, nodes: ['D', 'E'] },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };

      const childToParentMap = buildParentMap(graph);
      removeFromParent(graph, childToParentMap, 'D');

      expect(graph).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.DO_IN_PARALLEL, nodes: [null, 'E'] },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      });
    });
  });

  describe('deleteNode', () => {
    it('should delete a block node with children', () => {
      const graph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          B: { type: NODE_TYPES.IF_ELSE, trueNode: 'D', falseNode: 'E' },
          C: { type: NODE_TYPES.DEFAULT },
          D: { type: NODE_TYPES.DEFAULT },
          E: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['B'],
          B: ['C'],
        },
      };

      deleteNode(graph, 'B');

      expect(graph).toEqual({
        rootNode: 'A',
        nodes: {
          A: { type: NODE_TYPES.DEFAULT },
          C: { type: NODE_TYPES.DEFAULT },
        },
        edges: {
          A: ['C'],
        },
      });
    });
  });
});
