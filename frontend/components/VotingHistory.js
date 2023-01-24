import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWeb3React } from '@web3-react/core';
import {
  Card,
  CardBody,
  Badge,
  Box,
  Flex,
  Heading,
  Link,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'

import { BigNumber, Contract, providers, utils } from 'ethers';
import { ipfs, daoAddress, daoTokenAddress, targetNetworkId } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import coderDAOTokenAbi from '../abis/CoderDAOToken.json';
import { proposalStatus, genProposalId } from '../utils';
import { voteColorFromInt, voteStringFromInt } from '../utils/vote';
import Identity from '../components/Identity';

export default function ({ proposal }) {

  const [proposalState, setProposalState] = useState();
  const { account, chainId, library } = useWeb3React();
  const {
    register, handleSubmit, formState: { errors }
  } = useForm();

  const [votingHistory, setVotingHistory] = useState();
  const [votingState, setVotingState] = useState();
  const [votingPower, setVotingPower] = useState();



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

    // TODO Switch to raw, because blockNumber is absent. See proposal history.
    /* 
    LogDescription
    args: 
    (5) ['0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', BigNumber, 1, BigNumber, '', voter: '0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', proposalId: BigNumber, support: 1, weight: BigNumber, reason: '']
    eventFragment: {name: 'VoteCast', anonymous: false, inputs: Array(5), type: 'event', _isFragment: true}
    name: "VoteCast"
    signature: "VoteCast(address,uint256,uint8,uint256,string)"
    topic: "0xb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4"
    */
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
    setVotingHistory(votes)

    let votingState = votes.filter(vote => vote.voter == account);
    votingState = votingState[0]
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

  if (!votingHistory) {
    return <></>
  }

  return (
    <Card shadow={'md'} m='5'>
      <CardBody>
        <Heading as='h3' size='md'>Voting history</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Voter</Th>
              <Th>Vote</Th>
              <Th isNumeric>Power</Th>
            </Tr>
          </Thead>
          <Tbody>
            {votingHistory.map(vote => <Tr>
              <Td><Identity address={vote.voter} /></Td>
              <Td><Badge colorScheme={voteColorFromInt(vote.vote)} variant='solid'>{voteStringFromInt(vote.vote)}</Badge></Td>
              <Td isNumeric>{vote.weight}</Td>
            </Tr>)}
          </Tbody></Table>
      </CardBody>
    </Card>

  )
}
