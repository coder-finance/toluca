import { useState, useEffect } from 'react';

import { Box, Card, CardBody, Link, SimpleGrid } from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core';
import { Contract } from 'ethers';

import Proposal from './Proposal';
import { daoAddress } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import { ProposalFromLog } from '../utils/proposal';

function HomeGallery(props) {
  const { account, chainId, library } = useWeb3React();
  const [proposals, setProposals] = useState([]);

  const fetcher = async () => {
    if (!account) return;

    const lib = await library;

    // get from events the proposal details
    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
    const filters = await coderDaoContract.filters.ProposalCreated();
    const logs = await coderDaoContract.queryFilter(filters, 0, 'latest');
    const proposals = logs.map((log) => ProposalFromLog(coderDaoContract, log));

    // latest state of proposal
    setProposals(proposals);
  };

  useEffect(() => {
    fetcher();
  }, [account, chainId]);

  return (
    <SimpleGrid columns={2} spacing={10}>
      {proposals
        && proposals.map((proposal, i) => (
          <Proposal proposal={proposal} />
        ))}
    </SimpleGrid>
  );
}

export default HomeGallery;
