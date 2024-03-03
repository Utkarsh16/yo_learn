import React, { useMemo } from 'react';
import type { CanvasProps } from '../../Canvas.types';
import { getType, isABlock } from '../../helpers/generalHelpers';
import { getNodeBranches, getNodeChildren } from '../../helpers/nodeNavigation';
import { useGetNodesStore } from '../../stores/useCanvasStore';
import renderBlockBasedOnType from './blockRenderers';
import renderNodeBasedOnType from './nodeRenderers';

type NodesProps = {
  nodeRenderer: CanvasProps['nodeRenderer'];
};

const Nodes = ({ nodeRenderer }: NodesProps) => {
  const {
    allNodeIds,
    nodePositions,
    nodesClone: nodes,
    blockBranchNodes,
  } = useGetNodesStore().nodesInfo;

  const [nonBlockNodes, blockNodes, blocksWhichAreBranches] = useMemo(() => {
    const nonBlock = allNodeIds.filter((nodeId: string) => {
      const nodeType = getType(nodes, nodeId);
      const isBlock = isABlock(nodeType);

      if (isBlock || blockBranchNodes.includes(nodeId)) return false;

      return true;
    });

    const block = allNodeIds.filter((nodeId: string) => {
      const nodeType = getType(nodes, nodeId);
      return isABlock(nodeType);
    });

    const blocksWhichAreAlsoBranches: Record<string, string> = {};

    block.forEach((blockId: string) => {
      if (blockBranchNodes.includes(blockId)) {
        // this block is a branch of another block, find its parent
        const parentBlockId = block.find(
          blk => getNodeBranches(nodes, blk)?.flat().includes(blockId)
        );
        if (parentBlockId) blocksWhichAreAlsoBranches[blockId] = parentBlockId;
      }
    });

    return [nonBlock, block, blocksWhichAreAlsoBranches];
  }, [allNodeIds, blockBranchNodes, nodes]);

  const nonBlockNodeChildrenMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    nonBlockNodes.forEach(nodeId => {
      const nodeChildren = getNodeChildren(nodes, nodeId);
      map[nodeId] = nodeChildren;
    });

    return map;
  }, [nodes, nonBlockNodes]);

  const renderNodes = () => {
    const nodesUI: JSX.Element[] = [];

    nonBlockNodes.forEach((nodeId: string) => {
      const nodeChildren = nonBlockNodeChildrenMap[nodeId] || [];
      const nodeType = getType(nodes, nodeId);

      nodesUI.push(
        <React.Fragment key={nodeId}>
          {renderNodeBasedOnType({
            nodeRenderer,
            nodeId,
            nodes,
            nodePositions,
            nodeChildren,
            type: nodeType,
          })}
        </React.Fragment>
      );
    });

    return nodesUI;
  };

  const blockNodeChildrenMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    blockNodes.forEach(nodeId => {
      const nodeChildren = getNodeChildren(nodes, nodeId);
      map[nodeId] = nodeChildren;
    });

    return map;
  }, [nodes, blockNodes]);

  const renderBlocks = () => {
    const blocksUI: JSX.Element[] = [];
    blockNodes.forEach((nodeId: string) => {
      const nodeChildren = blockNodeChildrenMap[nodeId] || [];
      const nodeType = getType(nodes, nodeId);

      blocksUI.push(
        <React.Fragment key={nodeId}>
          {renderBlockBasedOnType({
            nodeRenderer,
            nodeId,
            nodes,
            nodePositions,
            nodeChildren,
            type: nodeType,
            isBranch: Object.keys(blocksWhichAreBranches).includes(nodeId),
            parentBlock: blocksWhichAreBranches[nodeId],
          })}
        </React.Fragment>
      );
    });

    return blocksUI;
  };

  return (
    <>
      {renderNodes()}
      {renderBlocks()}
    </>
  );
};

export default React.memo(Nodes);
