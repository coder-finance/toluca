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

export default function ({ proposal }) {

  const [proposalState, setProposalState] = useState();
  const { account, chainId, library } = useWeb3React();
  const {
    register, handleSubmit, formState: { errors }
  } = useForm();

  const [votingState, setVotingState] = useState();

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
    console.log(702, votes)

    votes = events.map((e) => {
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

    setVotingState(votes.filter(vote => vote.voter == account))

    // latest state of proposal
    // setProposals(proposals);

  }

  useEffect(() => {
    fetcher(proposal);
  }, [account]);

  return (
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
  )
}
