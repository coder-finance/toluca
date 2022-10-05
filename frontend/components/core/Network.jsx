import React from 'react'
import { Box } from "rebass";
import { useWeb3React } from '@web3-react/core'

import { checkChainSupported, supportedChains } from '../../utils';

export default () => {
  const { account, chainId } = useWeb3React()

  return (account ? <Box
    sx={{
      display: 'inline-block',
      color: 'white',
      bg: checkChainSupported(chainId) ? 'primary' : 'red',
      px: 20,
      py: 1,
      borderRadius: 10,
    }} style={{ marginRight: '8px' }}>
    {checkChainSupported(chainId) ? supportedChains[chainId] : 'Wrong Network'}
  </Box> : null)
}