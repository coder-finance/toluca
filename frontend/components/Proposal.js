import { useState, useEffect } from 'react';
import { Contract, providers, utils } from 'ethers';
import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import ReactMarkdown from 'react-markdown';

import { daoAddress } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import { proposalStatus } from '../utils';

const connection = new providers.InfuraProvider('ropsten');

const Content = ({ content }) => (<Box px={2}>
  <Text fontSize={0}>Bounty: {content.bounty}</Text>
  <Text fontSize={0}>Category: {content.category}</Text>
  <Text fontSize={0}>Initiator: {content.initiator}</Text>
  <ReactMarkdown>{content.body}</ReactMarkdown>
</Box>);

export default function ({ proposal, previewOnly }) {
  const [proposalIPFSPath, setProposalIPFSPath] = useState();
  const [proposalState, setProposalState] = useState();
  const { account, library } = useWeb3React();

  // Only gets called when previewing (client-side)
  useEffect(() => {
    if (!previewOnly) return;

    const ProposalRetrievalFn = async () => {
      if (account) {
        // The Contract object
        const coderDao = new Contract(daoAddress, coderDAOAbi, connection);
        const state = await coderDao.state(proposal.id);
        setProposalState({ state });
      }
    };
    ProposalRetrievalFn();
  }, []);

  if (!proposal) return (<>Loading...</>);

  return (
    <Box>
      <Card
        sx={{
          p: 1,
          borderRadius: 2,
          boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
        }}
      >
        {/* <Image src={proposalIPFSPath} style={{ maxHeight: '500px' }} /> */}

        <Box px={2}>
          <Heading as="h3">
            {proposal.title}
          </Heading>
          <Text fontSize="2">
            {proposal.id}
          </Text>
          <Text fontSize={0}>
            State: {proposal && (proposal.state || proposalState) && `Ξ${proposalStatus(parseInt(proposal.state || proposalState.state))}`}
          </Text>
          {proposal.votes && <Box>
            <Text fontSize={0}>For: {proposal.votes.for}</Text>
            <Text fontSize={0}>Against: {proposal.votes.against}</Text>
            <Text fontSize={0}>Abstain: {proposal.votes.abstain}</Text>
          </Box>}
          {proposal.snapshot && <Text fontSize={0}>Snapshot: {proposal.snapshot}</Text>}
          {proposal.deadline && <Text fontSize={0}>Deadline: {proposal.deadline}</Text>}
          {!previewOnly && proposal.content && <Content content={proposal.content}/>}
        </Box>

      </Card>
    </Box>
  );
}
