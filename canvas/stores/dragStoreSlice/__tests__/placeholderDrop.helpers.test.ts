import * as uuid from 'uuid';
import { DROP_DIRECTION, NODE_TYPES } from '../../../Canvas.enums';
import type { CanvasGraph } from '../../../Canvas.types';
import { cloneNodes } from '../../../helpers/generalHelpers';
import { createNewNode } from '../../../helpers/nodeCreation';
import {
  directNodeChildren,
  getNodeBranches,
} from '../../../helpers/nodeNavigation';
import { getConsolidatedNodesInfo } from '../../nodeStoreSlice/nodeStoreSlice.helpers';
import { performDropOnPlaceholderNode } from '../placeholderDrop.helpers';

jest.mock('uuid', () => {
  const originalModule = jest.requireActual('uuid');
  return {
    ...originalModule,
    v4: jest.fn(),
  };
});

describe('performDropOnPlaceholderNode.helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const uuidV4Mock = uuid.v4 as jest.Mock;
    // just use an auto-incrementing number when we request a uuid
    let i = 0;
    uuidV4Mock.mockImplementation(() => {
      i += 1;
      return i;
    });
  });

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

  describe('dragging onto a placeholder node', () => {
    it('should insert a basic node as a branch of an if/else node', () => {
      const originalGraph = cloneNodes(workflowGraph);
      const nodesInfo = getConsolidatedNodesInfo(originalGraph);

      // using the nodesClone since it has all the placeholders added by getConsolidatedNodesInfo
      const preprocessed = cloneNodes(nodesInfo.nodesClone);

      const newNode = createNewNode(NODE_TYPES.DEFAULT);
      preprocessed.nodes[newNode.id] = newNode;

      // get the id of the false branch's placeholder node
      const [, falsePlaceholderId] = directNodeChildren(preprocessed, 'B');

      // preprocessing adds these placeholders, but the output after calling performDrop is sanitized so they're gone
      expect(getNodeBranches(preprocessed, 'B')).toEqual([
        ['I', 'D', 'J', 'DROP_TARGET_PLACEHOLDER_5'],
        ['DROP_TARGET_PLACEHOLDER_1'],
      ]);

      const actual = performDropOnPlaceholderNode({
        dropDirection: DROP_DIRECTION.TOP,
        nodes: preprocessed,
        nodesInfo,
        sourceNodeId: newNode.id,
        targetNodeId: falsePlaceholderId!,
      });

      expect(getNodeBranches(actual.nodes, 'B')).toEqual([
        ['I', 'D', 'J'],
        ['DEFAULT_7'],
      ]);
    });

    it('should insert a basic node after an if/else node with placeholders', () => {
      const originalGraph: CanvasGraph = {
        rootNode: 'A',
        nodes: {
          A: {
            type: NODE_TYPES.DEFAULT,
          },
          B: {
            type: NODE_TYPES.IF_ELSE,
            trueNode: null,
            falseNode: null,
          },
        },
        edges: {
          A: ['B'],
        },
      };

      const nodesInfo = getConsolidatedNodesInfo(originalGraph);

      const preprocessed = cloneNodes(nodesInfo.nodesClone);

      const newNode = createNewNode(NODE_TYPES.DEFAULT);
      preprocessed.nodes[newNode.id] = newNode;

      const placeholderId = preprocessed.edges.B[0];

      // preprocessing adds these placeholders, but the output after calling performDrop is sanitized so they're gone
      expect(getNodeBranches(preprocessed, 'B')).toEqual([
        ['DROP_TARGET_PLACEHOLDER_1'],
        ['DROP_TARGET_PLACEHOLDER_2'],
      ]);

      const actual = performDropOnPlaceholderNode({
        dropDirection: DROP_DIRECTION.TOP,
        nodes: preprocessed,
        nodesInfo,
        sourceNodeId: newNode.id,
        targetNodeId: placeholderId!,
      });

      expect(getNodeBranches(actual.nodes, 'B')).toEqual([]);
    });
  });
});
