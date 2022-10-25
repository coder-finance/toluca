import { useState, useEffect } from 'react';
import { BigNumber, Contract, providers, utils } from 'ethers';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  Heading,
  Text
} from 'rebass';
import { Flex, Box as FlexBox } from 'reflexbox';
import { useWeb3React } from '@web3-react/core';
import ReactMarkdown from 'react-markdown';

import { ipfs, daoAddress, daoTokenAddress, targetNetworkId } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import coderDAOTokenAbi from '../abis/CoderDAOToken.json';

import { proposalStatus, genProposalId } from '../utils';

const connection = new providers.InfuraProvider(targetNetworkId);


export default function ({ proposal }) {
  const [proposalState, setProposalState] = useState();
  const { account, chainId, library } = useWeb3React();
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();

  const ProposalHead = ({ proposal }) => {
    return (<>
      <Heading as="h3">
        {proposal.title} aaa
      </Heading>

      <Flex variant="proposal.meta">
        <Box>
          <Box variant='badge'>
            {proposalStatus(parseInt(proposal.state))}
          </Box>
        </Box>
        <Box>
          <strong>ID:</strong> {proposal.id} <br />
          <strong>CID:</strong> <a href={`${ipfs.httpGateway}${proposal.hash}`}>{proposal.hash}</a>
        </Box>
      </Flex>
    </>
    )
  }

  const ProposalVotesSummary = ({ proposal }) => {
    if (!proposal.votes) {
      return
    }

    return (
      <Flex variant="proposal.votes">
        <Box variant='proposal.votes.for'>
          ✅ For: <span>{proposal.votes.for}</span>
        </Box>
        <Box variant='proposal.votes.against'>
          🚫 Against: <span>{proposal.votes.against}</span>
        </Box>
        <Box variant='proposal.votes.abstain'>
          ⭕️ Abstain: <span>{proposal.votes.abstain}</span>
        </Box>
      </Flex>
    )
  }


  // Only gets called when previewing (client-side)
  useEffect(() => {
    const ProposalRetrievalFn = async () => {
      if (account) {
        // The Contract object
        const coderDao = new Contract(daoAddress[chainId], coderDAOAbi, connection);
        const state = await coderDao.state(proposal.id);
        setProposalState({ state });
      }
    };
    ProposalRetrievalFn();
  }, []);


  if (!proposal) return (<>Loading...</>);

  return <Box variant="proposal">
    <ProposalHead proposal={proposal} proposalState={proposalState} />
    <ProposalVotesSummary proposal={proposal} />
  </Box>;
}
