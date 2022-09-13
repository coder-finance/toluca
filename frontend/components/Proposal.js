import { useState, useEffect } from 'react';
import { Contract, providers, utils } from 'ethers';
import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass';
import { Flex, Box as FlexBox } from 'reflexbox';
import { useWeb3React } from '@web3-react/core';
import ReactMarkdown from 'react-markdown';

import { daoAddress, ipfs } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import { proposalStatus } from '../utils';

const connection = new providers.InfuraProvider('ropsten');

const Content = ({ content }) => (<Box px={2}>
  <ReactMarkdown>{content.body}</ReactMarkdown>
</Box>);

const PreviewBox = ({ proposal, proposalState }) => (
  <Box px={0}>
    <Heading as="h1">
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
  </Box>
);

const FullView = ({ proposal, proposalState }) => (
  <>
    <Flex>
      <FlexBox width={[1/2]} p={1}>
        <Card>
          <Heading as="h1">
            {proposal.title}
          </Heading>
          <Text fontSize="2">
            {proposal.id}
          </Text>
          <Text fontSize={1}>CID: <a href={`${ipfs.httpGateway}${proposal.hash}`}>{proposal.hash}</a></Text>
          <Text fontSize={0}>
            State: {proposal && (proposal.state || proposalState) && `Ξ${proposalStatus(parseInt(proposal.state || proposalState.state))}`}
          </Text>
          {proposal.snapshot && <Text fontSize={0}>Snapshot: {proposal.snapshot}</Text>}
          {proposal.deadline && <Text fontSize={0}>Deadline: {proposal.deadline}</Text>}
        </Card>
      </FlexBox>
      <FlexBox width={[1/2]} p={1}>
        <Card>
        <Box
          >
            {proposal.votes && <Box>
              <Text fontSize={0}>For: {proposal.votes.for}</Text>
              <Text fontSize={0}>Against: {proposal.votes.against}</Text>
              <Text fontSize={0}>Abstain: {proposal.votes.abstain}</Text>
              <Text fontSize={0}>Bounty: {proposal.content.bounty}</Text>
              <Text fontSize={0}>Category: {proposal.content.category}</Text>
              <Text fontSize={0}>Initiator: {proposal.content.initiator}</Text>
            </Box>}
          </Box>
        </Card>
      </FlexBox>
    </Flex>
    <article>
      {proposal.content && <Content content={proposal.content}/>}
    </article>
    </>
);

export default function ({ proposal, previewOnly }) {
  const [proposalState, setProposalState] = useState();
  const { account } = useWeb3React();

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

  return previewOnly ?
    <PreviewBox proposal={proposal} proposalState={proposalState} /> :
    <FullView proposal={proposal} proposalState={proposalState} />;
}
