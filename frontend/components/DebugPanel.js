import { useState } from 'react';
import { Button, Text } from 'rebass';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../connectors';

export default function ({ proposal }) {
  const { account } = useWeb3React();

  const onExecute = () => {
    console.info('todo: onExecute')
  };

  const onVerify = () => {
    console.info('todo: onExecute')
  };

  const onConfirm = () => {
    console.info('todo: onExecute')
  };

  if (account !== '0xce1B9e1900108Cb779699319B1E37897d1E65c2B') return null;

  return (
    <>
      <Text
        fontSize={1}
        fontWeight="bold"
      >
      </Text>
      <Button
        sx={{
          fontSize: 1,
          textTransform: 'uppercase',
          borderRadius: 99999,
        }}
        onClick={onExecute}
      >
        Execute
      </Button>
      <Button
        sx={{
          fontSize: 1,
          textTransform: 'uppercase',
          borderRadius: 99999,
        }}
        onClick={onVerify}
      >
        Verify 
      </Button>
      <Button
        sx={{
          fontSize: 1,
          textTransform: 'uppercase',
          borderRadius: 99999,
        }}
        onClick={onConfirm}
      >
        Confirm Merge
      </Button>
    </>);
}
