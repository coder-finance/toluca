import React from 'react'
import { Tag } from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core'

import { checkChainSupported, supportedChains } from '../../utils';

export default () => {
  const { account, chainId } = useWeb3React()

  return (account ? <Tag colorScheme='blue' size='lg'>
    {checkChainSupported(chainId) ? supportedChains[chainId] : 'Wrong Network'}
  </Tag > : null)
}