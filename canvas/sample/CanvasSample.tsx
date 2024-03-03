/* eslint-disable rippling-eslint/no-hard-coded-strings */
import React from 'react';
import { Notice, Tabs } from '@rippling/ui';
import AdvancedVersion from './AdvancedVersion';
import BasicVersion from './BasicVersion';

const CanvasSample = () => {
  return (
    <>
      <Notice.Alert description="If you are reading this, please DO NOT USE this component. Its a WORK IN PROGRESS!" />
      <Tabs>
        <Tabs.Tab title="Advanced Version (Locked)">
          <AdvancedVersion />
        </Tabs.Tab>
        <Tabs.Tab title="Basic Version">
          <BasicVersion />
        </Tabs.Tab>
      </Tabs>
    </>
  );
};

export default CanvasSample;
