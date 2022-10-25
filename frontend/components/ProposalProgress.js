import { useState, useEffect } from 'react';
import {
  Box, Heading, Flex,
} from 'rebass';
import { Box as FlexBox } from 'reflexbox';
import { Contract, providers } from 'ethers';
import { useWeb3React } from '@web3-react/core';

import coderDAOAbi from '../abis/CoderDAO.json';
import { daoAddress, targetNetworkId } from '../constants';
import { GetEvent, GetProposalEvents } from '../utils/events'

const connection = new providers.InfuraProvider(targetNetworkId);

const ProposalProgress = ({ proposal }) => {
  const { account, chainId, library } = useWeb3React();
  const [proposalLog, setProposalLog] = useState();

  // Only gets called when previewing (client-side)
  const onClientSide = typeof window !== 'undefined';

  if (onClientSide) {
    useEffect(() => {
      const ProposalRetrievalFn = async () => {
        if (account) {
          const lib = await library;
          const coderDao = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
          let events = await GetProposalEvents(proposal, connection, coderDao)
          setProposalLog(events);
        }
      };

      ProposalRetrievalFn();
    }, [account]);
  }

  let rows = []
  if (proposalLog) {
    rows = proposalLog.map(log => <Flex>
      <Box variant="proposal.history.blockNumber">{log.blockNumber.toString()}</Box>
      <Box variant="proposal.history.name">{log.name}</Box>
    </Flex>)
  }

  return <Box variant="proposal.history">
    <Heading as='h3'>History</Heading>
    {rows}
  </Box>
};

export default ProposalProgress;
