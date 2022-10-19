import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWeb3React } from '@web3-react/core';
import {
  Box,
  Heading,
  Button
} from 'rebass';
import {
  Label,
  Radio,
} from '@rebass/forms';
import { BigNumber, Contract, providers, utils } from 'ethers';
import { ipfs, daoAddress, daoTokenAddress, targetNetworkId } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import coderDAOTokenAbi from '../abis/CoderDAOToken.json';
import { proposalStatus, genProposalId } from '../utils';
import { voteIntFromLabel, voteStringFromInt } from '../utils/vote';

export default function ({ proposal }) {

  const [proposalState, setProposalState] = useState();
  const { account, chainId, library } = useWeb3React();
  const {
    register, handleSubmit, formState: { errors }
  } = useForm();

  const [votingState, setVotingState] = useState();
  const [votingPower, setVotingPower] = useState();

  const onSubmit = async (formData, e) => {
    const lib = await library;
    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
    const tokenContract = new Contract(daoTokenAddress[chainId], coderDAOTokenAbi, lib.getSigner());
    const transferCalldata = tokenContract.interface.encodeFunctionData('transfer', ['0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', 1]);
    const proposalIdFromPartsU256 = genProposalId(proposal, transferCalldata, library, chainId);

    const accountAddress = await lib.getSigner().getAddress();
    console.log("Signer", accountAddress)
    let delegateTx = await tokenContract.delegate(accountAddress);
    console.log("DelegateTx", delegateTx);

    let voteTx = await coderDaoContract.castVote(proposalIdFromPartsU256, voteIntFromLabel(formData.voteValue));
    console.log("VoteTx", voteTx);
  };

  const fetcher = async (proposal) => {

    if (!account) return;
    const lib = await library;

    // get from events the proposal details
    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
    const tokenContract = new Contract(daoTokenAddress[chainId], coderDAOTokenAbi, lib.getSigner());
    const transferCalldata = tokenContract.interface.encodeFunctionData('transfer', ['0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', 1]);
    const proposalIdFromPartsU256 = await genProposalId(proposal, transferCalldata, library, chainId);

    const filters = await coderDaoContract.filters.VoteCast();
    const logs = await coderDaoContract.queryFilter(filters, 0, 'latest');
    const events = logs.map((log) => coderDaoContract.interface.parseLog(log));

    let votes = events.filter(event => event.args.proposalId.eq(proposalIdFromPartsU256));
    votes = votes.map((x) => {
      return ({
        proposalId: x.args.proposalId.toHexString(),
        vote: x.args.support,
        voter: x.args.voter,
        weight: x.args.weight.toString(),
      })
    });
    let votingState = votes.filter(vote => vote.voter == account);
    if (votingState) {
      votingState = votingState[0]
    } else {
      votingState = {}
    }
    setVotingState(votingState)

    const votingPower = await tokenContract.getVotes(lib.getSigner().getAddress());
    console.log("VotingPower", votingPower)
    if (votingPower) {
      setVotingPower(votingPower.div(BigNumber.from(10).pow(18)).toString())
    } else {
      setVotingPower("0")
    }

  }

  useEffect(() => {
    fetcher(proposal);
  }, [account]);

  const VotingState = (props) => {
    if (props.votingState) {
      return (
        <Box p={3}>You voted <Box p={1} bg="green" display='inline-block'>{voteStringFromInt(props.votingState.vote)}</Box> with weight {props.votingState.weight}</Box>
      )

    }
  };

  const VotingForm = (props) => {
    if (props.votingState) {
      return (<></>)
    }

    return (
      <Box p={3}>
        <Heading p={1}>Your vote (weight = {votingPower}):</Heading>
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
    )
  };
  return (
    <>
      <VotingState votingState={votingState} />
      <VotingForm votingState={votingState} votingPower={votingPower} />
    </>

  )
}
