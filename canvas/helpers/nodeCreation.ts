import { v4 as uuid } from 'uuid';
import { NODE_TYPES, PLACEHOLDER_NODES, UTILITY_NODES } from '../Canvas.enums';
import type { ALL_NODE_TYPES, Node } from '../Canvas.types';

export type CreatedNode = Required<Node>;

function generateId(type: string) {
  return `${type}_${uuid()}`;
}

function createOnceAllCompletedNode(): CreatedNode {
  const type = UTILITY_NODES.ONCE_ALL_COMPLETED;
  return {
    id: generateId(type),
    type,
  };
}

function createIfNode(): CreatedNode {
  const type = NODE_TYPES.IF_ELSE;
  return {
    id: generateId(type),
    type,
    trueNode: null,
    falseNode: null,
  };
}

function createForNode(): CreatedNode {
  const type = NODE_TYPES.FOR_EACH;
  return {
    id: generateId(type),
    type,
    body: null,
  };
}

function createDoParallelNode(): CreatedNode {
  const type = NODE_TYPES.DO_IN_PARALLEL;
  return {
    id: generateId(type),
    type,
    nodes: [],
  };
}

function createActionNode(metadata?: Record<string, unknown>): CreatedNode {
  const type = NODE_TYPES.DEFAULT;
  return {
    id: generateId(type),
    type,
    metadata: metadata ?? {},
  };
}

function createEmptyStatePlaceholderNode(): CreatedNode {
  const type = PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER;
  return {
    id: generateId(type),
    type,
  };
}

function createDropTargetPlaceholderNode(): CreatedNode {
  const type = PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER;
  return {
    id: generateId(type),
    type,
  };
}

export const createNewNode = (
  type: ALL_NODE_TYPES,
  metadata?: Record<string, unknown>
): CreatedNode => {
  switch (type) {
    case NODE_TYPES.IF_ELSE: {
      return createIfNode();
    }
    case NODE_TYPES.FOR_EACH: {
      return createForNode();
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      return createDoParallelNode();
    }
    case NODE_TYPES.DEFAULT: {
      return createActionNode(metadata);
    }
    case PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER: {
      return createEmptyStatePlaceholderNode();
    }
    case PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER: {
      return createDropTargetPlaceholderNode();
    }
    case UTILITY_NODES.ONCE_ALL_COMPLETED: {
      return createOnceAllCompletedNode();
    }
    default: {
      // eslint-disable-next-line
      throw new Error(`Invalid node type: ${type}`);
    }
  }
};
