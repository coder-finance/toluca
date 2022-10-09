import { useState, useEffect } from 'react';
import { BigNumber, Contract, providers, utils } from 'ethers';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  Button,
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

  const onSubmit = async (formData, e) => {
    const lib = await library;

    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
    const tokenContract = new Contract(daoTokenAddress[chainId], coderDAOTokenAbi, lib.getSigner());
    const transferCalldata = tokenContract.interface.encodeFunctionData('transfer', ['0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', 1]);
    const proposalIdFromPartsU256 = genProposalId(proposal, transferCalldata, library, chainId);


    console.log(104, proposalIdFromPartsU256);
    let voteValueInt = -1;
    switch (formData.voteValue) {
      case "for":
        voteValueInt = 1;
        break;
      case "against":
        voteValueInt = 2;
        break;
      case "abstain":
        voteValueInt = 3;
        break;
      default:
        console.error("Invalid voteValue", formData.voteValue)
    }

    let voteTx = await coderDaoContract.castVote(proposalIdFromPartsU256, voteValueInt);

    console.log(103, voteTx);
  };


  const FullView = ({ proposal, proposalState }) => {

    const { account, chainId, library } = useWeb3React();

    const fetcher = async (proposal) => {

      if (!account) return;
      const lib = await library;

      // get from events the proposal details
      const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
      const tokenContract = new Contract(daoTokenAddress[chainId], coderDAOTokenAbi, lib.getSigner());
      const transferCalldata = tokenContract.interface.encodeFunctionData('transfer', ['0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', 1]);
      const proposalIdFromPartsU256 = genProposalId(proposal, transferCalldata, library, chainId);


      const filters = await coderDaoContract.filters.VoteCast();
      const logs = await coderDaoContract.queryFilter(filters, 0, 'latest');
      const events = logs.map((log) => coderDaoContract.interface.parseLog(log));

      console.log(700, events);

      const votes = events.map((e) => {
        const title = e.args.description;
        const hash = e.args.ipfsCid;

        return ({
          id: e.args.proposalId.toHexString(),
          description: e.args.description,
          title,
          hash,
          meta: `${e.args.proposalId.toString()} meta`
        })
      });

      // latest state of proposal
      // setProposals(proposals);
    }
    useEffect(() => {
      fetcher(proposal);
    }, [account]);




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
        <Box p={3}>
          <Heading p={1}>Your vote:</Heading>
          <Box as="form"
            onSubmit={handleSubmit(onSubmit, (e) => console.error)}>
            <Label p={1}>
              <Radio
                name='voteValue'
                id='for'
                value='for'
                {...register('voteValue', { required: true })}
              />
              ✅ For
            </Label>
            <Label p={1}>
              <Radio
                name='voteValue'
                id='against'
                value='against'
                {...register('voteValue', { required: true })}
              />
              🚫 Against
            </Label>
            <Label p={1}>
              <Radio
                name='voteValue'
                id='abstain'
                value='abstain'
                {...register('voteValue', { required: true })}
              />
              ⭕️ Abstain
            </Label>
            <Button>
              Submit
            </Button>
          </Box>
        </Box>
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
