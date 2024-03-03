import React from 'react';
import { Typography } from '@rippling/ui';
import { Colors } from '@rippling/ui/Constants';
import type { NodePosition } from '../../../Canvas.types';
import { DoInParallelBox } from './DoInParallel.styles';

const DoInParallelNode = ({
  nodePosition,
  text,
}: {
  nodePosition: NodePosition;
  text: string;
}) => {
  return (
    <>
      <DoInParallelBox cardPosition={nodePosition}>
        <Typography.Overline2 color={Colors.GRAY4}>{text}</Typography.Overline2>
      </DoInParallelBox>
    </>
  );
};

export default DoInParallelNode;
