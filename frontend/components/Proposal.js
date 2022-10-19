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

import { Label, Radio } from '@rebass/forms'
import ProposalVoting from './ProposalVoting';
import ProposalProgress from './ProposalProgress';
import ProposalContributionForm from './ProposalContributionForm';

const connection = new providers.InfuraProvider(targetNetworkId);

const Content = ({ content }) => (<Box px={2}>
  <ReactMarkdown>{content.body}</ReactMarkdown>
</Box>);

const PreviewBox = ({ proposal, proposalState }) => {
  const proposalStatusLabel = proposal && (proposal.state || proposalState) && proposalStatus(parseInt(proposal.state || proposalState.state));

  return (
    <Box px={0}>
      <Heading as="h1">
        {proposal.title}
      </Heading>
      <Text fontSize="2">
        {proposal.id}
      </Text>
      <Text fontSize={0}>
        State: `Ξ${proposalStatusLabel}`
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
};

const FullView = ({ proposal, proposalState }) => {
  const proposalStatusLabel = proposal && (proposal.state || proposalState) && proposalStatus(parseInt(proposal.state || proposalState.state));
  return (
    <>
      <Flex>
        <FlexBox width={[1 / 2]} p={1}>
          <Card>
            <Box p={2}>
              <Heading as="h1">
                {proposal.title}
              </Heading>
            </Box>
            <Box p={2}>
              <Text fontSize="2">
                {proposal.id}
              </Text>
            </Box>
            <Text fontSize={1}>CID: <a href={`${ipfs.httpGateway}${proposal.hash}`}>{proposal.hash}</a></Text>
            <Text fontSize={0}>
              State: {proposal && (proposal.state || proposalState) && `Ξ${proposalStatus(parseInt(proposal.state || proposalState.state))}`}
            </Text>
            {proposal.snapshot && <Text fontSize={0}>Snapshot: {proposal.snapshot}</Text>}
            {proposal.deadline && <Text fontSize={0}>Deadline: {proposal.deadline}</Text>}
          </Card>
        </FlexBox>
        <FlexBox width={[1 / 2]} p={1}>
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

      <Flex>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Pending' ? 'primary' : 'secondary'}>
          Pending
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Active' ? 'primary' : 'secondary'}>
          Active
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Canceled' ? 'primary' : 'secondary'}>
          Canceled
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Defeated' ? 'primary' : 'secondary'}>
          Defeated
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Succeeded' ? 'primary' : 'secondary'}>
          Succeeded
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Queued' ? 'primary' : 'secondary'}>
          Queued
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Expired' ? 'primary' : 'secondary'}>
          Expired
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Executed' ? 'primary' : 'secondary'}>
          Executed
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Verified' ? 'primary' : 'secondary'}>
          Verified
        </Box>
        <Box p={3} color='white' bg={proposalStatusLabel == 'Merged' ? 'primary' : 'secondary'}>
          Merged
        </Box>
      </Flex>
      <Box p={3}
        as="form"
        onSubmit={handleVote(onSubmit)}
      >
        <Heading p={1}>Your vote:</Heading>
        <Box>
          <Label p={1}>
            <Radio
              name='vote'
              id='for'
              value='for'
            />
            For
          </Label>
          <Label p={1}>
            <Radio
              name='vote'
              id='against'
              value='against'
            />
            Against
          </Label>
          <Label p={1}>
            <Radio
              name='vote'
              id='abstain'
              value='abstain'
            />
            Abstain
          </Label>
        </Box>
      </Box>
      <ProposalProgress proposal={proposal} />
    </>)
}

export default function ({ proposal, previewOnly }) {
  const [proposalState, setProposalState] = useState();
  const { account, chainId, library } = useWeb3React();
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();




  const FullView = ({ proposal, proposalState }) => {

    const proposalStatusLabel = proposal && (proposal.state || proposalState) && proposalStatus(parseInt(proposal.state || proposalState.state));
    return (
      <>
        <Flex>
          <FlexBox width={[1 / 2]} p={1}>
            <Card>
              <Box p={2}>
                <Heading as="h1">
                  {proposal.title}
                </Heading>
              </Box>
              <Box p={2}>
                <Text fontSize="2">
                  {proposal.id}
                </Text>
              </Box>
              <Text fontSize={1}>CID: <a href={`${ipfs.httpGateway}${proposal.hash}`}>{proposal.hash}</a></Text>
              <Text fontSize={0}>
                State: {proposal && (proposal.state || proposalState) && `Ξ${proposalStatus(parseInt(proposal.state || proposalState.state))}`}
              </Text>
              {proposal.snapshot && <Text fontSize={0}>Snapshot: {proposal.snapshot}</Text>}
              {proposal.deadline && <Text fontSize={0}>Deadline: {proposal.deadline}</Text>}
            </Card>
          </FlexBox>
          <FlexBox width={[1 / 2]} p={1}>
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

        <Flex>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Pending' ? 'primary' : 'secondary'}>
            Pending
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Active' ? 'primary' : 'secondary'}>
            Active
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Canceled' ? 'primary' : 'secondary'}>
            Canceled
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Defeated' ? 'primary' : 'secondary'}>
            Defeated
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Succeeded' ? 'primary' : 'secondary'}>
            Succeeded
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Queued' ? 'primary' : 'secondary'}>
            Queued
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Expired' ? 'primary' : 'secondary'}>
            Expired
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Executed' ? 'primary' : 'secondary'}>
            Executed
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Verified' ? 'primary' : 'secondary'}>
            Verified
          </Box>
          <Box p={3} color='white' bg={proposalStatusLabel == 'Merged' ? 'primary' : 'secondary'}>
            Merged
          </Box>
        </Flex>

        <ProposalVoting proposal={proposal} />
        <ProposalContributionForm proposal={proposal} />
        <ProposalProgress proposal={proposal} />
      </>)
  }


  // Only gets called when previewing (client-side)
  useEffect(() => {
    if (!previewOnly) return;

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

  return previewOnly ?
    <PreviewBox proposal={proposal} proposalState={proposalState} /> :
    <FullView proposal={proposal} proposalState={proposalState} />;
}
