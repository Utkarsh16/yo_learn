import dagre from '@dagrejs/dagre';
import type { GraphLabel } from 'dagre';
import { NODE_SPACING } from '../../Canvas.constants';
import {
  NODE_TYPES,
  PLACEHOLDER_NODES,
  UTILITY_NODES,
} from '../../Canvas.enums';
import type { ALL_NODE_TYPES, CanvasGraph } from '../../Canvas.types';
import {
  cloneNodes,
  getNodeDimensions,
  getType,
  isABlock,
  isDoInParallelNode,
  isPlaceholderNode,
} from '../../helpers/generalHelpers';
import { cloneChildren, setNodeChildren } from '../../helpers/nodeChildren';
import { createNewNode } from '../../helpers/nodeCreation';
import {
  directNodeChildren,
  getBlockChildren,
  getBlockNodes,
  getNodeBranches,
  getNodeChildren,
} from '../../helpers/nodeNavigation';
import { convertToChildToParentMap } from '../../helpers/nodeProcessors';
import { insertAfter } from '../dragStoreSlice/nodes.helpers';

/**
 * Util to find all node ids present in the nodes object
 */
const getAllNodeIds = (graph: CanvasGraph) => {
  return Object.keys(graph.nodes);
};

/**
 * Util to adjust the positions of nodes in the graph -
 *
 * 1. Since dagre does not plot the graph's root node at (0,0) so we need to adjust the x position of all nodes
 *    - Find the deltaX to move the root node to (0,0)
 *    - Subtract the deltaX from the x position of all nodes
 *
 * 2. Dagre puts the nodes in parallel branches towards the end of the branch, thus parallel branches with
 *    unequal number of nodes are not aligned properly -> This function traverses the branches of blocks and
 *    adjusts the y position of nodes in each branch, the loop runs equal to the length of the shortest branch
 */
const updatePositionsPostTransformations = (
  graph: CanvasGraph,
  positions: Record<string, { x: number; y: number }>
): void => {
  const { rootNode } = graph;
  // eslint-disable-next-line
  if (!rootNode) throw new Error('Root node not found');

  // 1.
  const deltaX = positions[rootNode].x;
  Object.keys(graph.nodes).forEach(nodeId => {
    if (positions[nodeId]) positions[nodeId].x -= deltaX;
  });
  positions[rootNode].x = 0;

  // 2.
  const blockNodes = getBlockNodes(graph);
  blockNodes.forEach(blockId => {
    const branches = getNodeBranches(graph, blockId);
    const minBranchLength = Math.min(...branches.map(branch => branch.length));

    for (let i = 0; i < minBranchLength; i++) {
      // Find the min Y of all the nodes at the same level
      let minY = Infinity;
      branches.forEach(branch => {
        const node = branch[i];
        minY = Math.min(minY, positions[node]?.y);
      });

      // Set the Y of all the nodes at the same level to the min Y
      branches.forEach(branch => {
        const node = branch[i];
        if (positions[node]) positions[node].y = minY;
      });
    }
  });
};

const getDagreGraphPositions = (graph: CanvasGraph) => {
  const DAGRE_LAYOUT = 'TB';
  const nodes: { id: string; type: ALL_NODE_TYPES }[] = [];
  const { rootNode } = graph;

  // eslint-disable-next-line
  if (!rootNode) throw new Error('Root node not found');

  const traverse = (startingNodeId: string) => {
    nodes.push({ id: startingNodeId, type: graph.nodes[startingNodeId].type });

    const children = getNodeChildren(graph, startingNodeId);
    children.forEach(child => {
      traverse(child);
    });
  };
  traverse(rootNode);

  const edges = nodes.reduce(
    (acc, { id: nodeId }) => {
      const children = getNodeChildren(graph, nodeId);
      children.forEach(child => {
        acc.push({ source: nodeId, target: child });
      });
      return acc;
    },
    [] as { source: string; target: string }[]
  );

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}));

  // Set an object for the graph label
  // https://github.com/dagrejs/dagre/wiki#configuring-the-layout
  g.setGraph({
    rankdir: DAGRE_LAYOUT,
    root: rootNode,
    nodesep: NODE_SPACING.horizontal,
    ranksep: NODE_SPACING.vertical,
  } as GraphLabel);

  // Add nodes to the graph
  nodes.forEach(node => {
    const dimensions = getNodeDimensions(node.type);
    g.setNode(node.id, {
      label: node.id,
      width: dimensions.width,
      height: dimensions.height,
    });
  });

  // Add edges to the graph
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Get the positions of nodes
  const positions: Record<string, { x: number; y: number }> = {};
  g.nodes().forEach(nodeId => {
    const node = g.node(nodeId);
    positions[nodeId] = { x: node.x, y: node.y };
  });

  return positions;
};

const getNodePositions = (graph: CanvasGraph) => {
  const nodePositions = getDagreGraphPositions(graph);
  updatePositionsPostTransformations(graph, nodePositions);
  return nodePositions;
};

/**
 * Util to find the root node of the tree
 */
const findRootNode = (
  nodes: CanvasGraph,
  childToParentMap: Record<string, string[]>
) => {
  const allParents = Object.keys(nodes.nodes);
  const allChildren = Object.keys(childToParentMap);

  const rootNode = allParents.find(parent => !allChildren.includes(parent));

  // Disabling this rule because its a dev error
  // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
  if (!rootNode) throw new Error('Root node not found');

  return rootNode;
};

/**
 * Util to find the first common element in an array of arrays
 */
const findFirstCommonElementWithIndices = (arrays: string[][]) => {
  const sets = arrays.map(array => new Set(array));

  for (let i = 0; i < arrays[0].length; i++) {
    const element = arrays[0][i];

    if (sets.slice(1).every(set => set.has(element))) {
      const indices = arrays.map(array => array.indexOf(element));
      return { element, indices };
    }
  }

  return null;
};

/**
 * Util to find the series of nodes starting from a given node
 */
const findBranch = (startingNodeId: string, graph: CanvasGraph) => {
  const series: string[] = [];
  let currentNodeId: string | null = startingNodeId;

  while (currentNodeId) {
    series.push(currentNodeId);
    const currentChildren = getNodeChildren(graph, currentNodeId);
    if (currentChildren.length === 0) {
      // Node not found or node has no children
      currentNodeId = null;
    } else {
      // assuming the parent has only 1 child, since this function is used to find a linear series of nodes
      currentNodeId = currentChildren[0];
    }
  }

  return series;
};

/**
 * Util to find all parallel branches starting from a given node
 */
const findParallelBranches = (graph: CanvasGraph, startingNodeId: string) => {
  const series: Record<string, string[]> = {};
  const stack: string[] = [];

  stack.push(startingNodeId);

  while (stack.length > 0) {
    const currentNodeId = stack.pop();
    const children = currentNodeId ? getNodeChildren(graph, currentNodeId) : [];

    for (const child of children) {
      // find branches for each child
      if (getNodeChildren(graph, child).length > 1) {
        stack.push(child);
      } else {
        series[child] = findBranch(child, graph);
      }
    }
  }

  return series;
};

/**
 * Adds ONCE_ALL_COMPLETED nodes to the tree
 */
const addOnceAllCompletedNodes = (graph: CanvasGraph) => {
  /**
   * Number of ONCE_ALL_COMPLETED nodes
   * = Number of DO_IN_PARALLEL nodes
   * = Number of parents with more than one child
   */
  const parentsWithMultipleChildren = Object.keys(graph.nodes).filter(
    parentId => {
      const hasMultipleChildren = getNodeChildren(graph, parentId).length > 1;
      const parentType = getType(graph, parentId);
      const isBlock = isABlock(parentType);
      const isPlaceholder = isPlaceholderNode(parentType);

      return !(isBlock || isPlaceholder) && hasMultipleChildren;
    }
  );

  /**
   * Traverse the tree from the bottom up to move from innermost DO_IN_PARALLEL nodes to outermost
   */
  parentsWithMultipleChildren.reverse().forEach((nodeId: string) => {
    /**
     * Find the list of nodes in each child branch of the parent
     */
    const parallelBranches = findParallelBranches(graph, nodeId);

    // Find the first common element along with indices for the parallel branches
    const commonElement = findFirstCommonElementWithIndices(
      Object.values(parallelBranches)
    );

    let parentNodes: string[] = [];

    /**
     * If a common element is found, then the parent nodes are the nodes just before the common element
     * else, the parent nodes are the last nodes in each branch
     */
    if (commonElement) {
      parentNodes = Object.values(parallelBranches).map(
        (value, index) => value[commonElement.indices[index] - 1]
      );
    } else {
      parentNodes = Object.values(parallelBranches).map(
        value => value[value.length - 1]
      );
    }

    // Create a ONCE_ALL_COMPLETED node
    const newNode = createNewNode(UTILITY_NODES.ONCE_ALL_COMPLETED);
    graph.nodes[newNode.id] = newNode;
    cloneChildren(graph, parentNodes[0], newNode.id);

    parentNodes.forEach((parent: string) => {
      graph.edges[parent] = [newNode.id];
    });

    // IF the parent with multiple children is a block
    if (isABlock(graph.nodes[nodeId].type)) {
      setNodeChildren(graph, {
        nodeId: newNode.id,
        childNodes: getBlockChildren(graph, nodeId),
      });
      graph.edges[nodeId] = [newNode.id];
    }
  });
};

/**
 * Inserts drop target placeholder nodes for each empty branch in a block.
 * The block should be empty when this is called.
 * @param graph
 * @param nodeId The id of the block node to create placeholders for
 */
export const addPlaceholderNodesForWholeBlock = (
  graph: CanvasGraph,
  nodeId: string
): void => {
  const node = graph.nodes[nodeId];
  switch (node.type) {
    case NODE_TYPES.IF_ELSE: {
      const yesPlaceholderNode = createNewNode(
        PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
      );
      const noPlaceholderNode = createNewNode(
        PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
      );
      graph.nodes[yesPlaceholderNode.id] = yesPlaceholderNode;
      graph.nodes[noPlaceholderNode.id] = noPlaceholderNode;

      node.trueNode = yesPlaceholderNode.id;
      node.falseNode = noPlaceholderNode.id;

      break;
    }
    case NODE_TYPES.FOR_EACH: {
      const placeholderNode = createNewNode(
        PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
      );
      graph.nodes[placeholderNode.id] = placeholderNode;
      node.body = placeholderNode.id;

      break;
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      node.nodes = [];

      // TODO: Write logic to run it equal to the branches
      [0, 1].forEach(() => {
        const placeholderNode = createNewNode(
          PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
        );
        graph.nodes[placeholderNode.id] = placeholderNode;

        node.nodes.push(placeholderNode.id);
        graph.edges[placeholderNode.id] = [];
      });
      break;
    }
    default:
      break;
  }
};

/**
 * Inserts placeholder nodes for branches of block nodes that are empty
 * @param nodes
 */
const addPlaceholderNodes = (nodes: CanvasGraph) => {
  getBlockNodes(nodes).forEach(blockId => {
    const currentBlock = nodes.nodes[blockId];
    const currentBlockBranches = getNodeBranches(nodes, blockId);
    const isWholeBlockEmpty = currentBlockBranches.length === 0;
    const isPartOfBlockEmpty = currentBlockBranches.find(
      branch => branch.length === 0
    );
    if (isWholeBlockEmpty) {
      setNodeChildren(nodes, {
        nodeId: blockId,
        childNodes: directNodeChildren(nodes, blockId).filter(nodeId => {
          return nodeId ? !isABlock(nodes.nodes[nodeId].type) : nodeId;
        }),
      });
      addPlaceholderNodesForWholeBlock(nodes, blockId);
    } else if (isPartOfBlockEmpty) {
      // we need to insert a placeholder node in the empty part of the block
      currentBlockBranches.forEach((branch: string[], index: number) => {
        if (branch.length === 0) {
          const placeholderNode = createNewNode(
            PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
          );

          nodes.nodes[placeholderNode.id] = placeholderNode;

          switch (currentBlock.type) {
            case NODE_TYPES.IF_ELSE: {
              if (index === 0) {
                currentBlock.trueNode = placeholderNode.id;
              } else if (index === 1) {
                currentBlock.falseNode = placeholderNode.id;
              }
              break;
            }
            case NODE_TYPES.FOR_EACH: {
              currentBlock.body = placeholderNode.id;
              break;
            }
            case NODE_TYPES.DO_IN_PARALLEL: {
              currentBlock.nodes[index] = placeholderNode.id;
              break;
            }
            default: {
              console.warn(
                `addPlaceholderNodes: invalid block type - ${currentBlock.type}`
              );
              break;
            }
          }
        }
      });
    }
  });
};

const addBlockChildPlaceholderNodes = (graph: CanvasGraph) => {
  /**
   * Add the placeholder nodes as the child of each block node
   */
  const blockIds = getBlockNodes(graph);
  blockIds.forEach(blockId => {
    const placeholderNode = createNewNode(
      isDoInParallelNode(getType(graph, blockId))
        ? UTILITY_NODES.ONCE_ALL_COMPLETED
        : PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER
    );
    graph.nodes[placeholderNode.id] = placeholderNode;
    insertAfter(graph, blockId, placeholderNode.id);
  });
};

/**
 * Pre processes the nodes object -
 *
 * 1. Adds empty state if there is only root node in the tree
 * 2. Adds placeholder nodes for empty IF_ELSE and FOR_EACH blocks
 * 3. Adds once all completed nodes
 */
export const preProcessNodes = (graph: CanvasGraph) => {
  const allNodeIds = getAllNodeIds(graph);
  const numberOfNodes = allNodeIds.length;

  // Case when the tree only has a root node
  if (numberOfNodes === 1) {
    const newEmptyState = createNewNode(
      PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER
    );
    const newNodeId = newEmptyState.id;

    if (newNodeId) {
      graph.nodes[newNodeId] = newEmptyState;
      graph.edges[allNodeIds[0]] = [newNodeId];
    }
  }

  // Mutating the nodes object directly inside the pre-processing functions
  addPlaceholderNodes(graph);
  addBlockChildPlaceholderNodes(graph);
  addOnceAllCompletedNodes(graph);

  return graph;
};

export const getConsolidatedNodesInfo = (nodes: CanvasGraph) => {
  const nodesClone = preProcessNodes(cloneNodes(nodes));

  const allNodeIds = getAllNodeIds(nodesClone);
  const childToParentMap = convertToChildToParentMap(nodesClone);
  const rootNode = findRootNode(nodesClone, childToParentMap);
  const blockBranchNodes = getBlockNodes(nodesClone).reduce(
    (acc: string[], block) => {
      acc.push(...getNodeBranches(nodesClone, block).flat());
      return acc;
    },
    []
  );

  /**
   * Node Positions
   */
  const nodePositions = getNodePositions(nodesClone);

  return {
    rootNode,
    nodesClone,
    allNodeIds,
    nodePositions,
    childToParentMap,
    blockBranchNodes,
  };
};
