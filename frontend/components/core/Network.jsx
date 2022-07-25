import React from 'react'
import {Box } from "rebass";
import { useWeb3React } from '@web3-react/core'

import { checkChainSupported } from '../../utils';

export default () => {
  const { chainId } = useWeb3React()

  return (<Box
    sx={{
      display: 'inline-block',
      color: 'white',
      bg: checkChainSupported(chainId) ? 'primary' : 'red',
      px: 20,
      py: 1,
      borderRadius: 10,
    }} style={{ marginRight: '8px' }}>
    {checkChainSupported(chainId) ? 'Ropsten' : 'Wrong Network'}
  </Box>)
}