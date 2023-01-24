import { useState, useEffect } from 'react';
import { BigNumber, Contract, providers, utils } from 'ethers';
import { useForm } from 'react-hook-form';
import {
  Badge,
  Box,
  Flex,
  Heading,
  Link,
  Stack,
  Stat,
  StatLabel,
  StatHelpText,
} from '@chakra-ui/react';
import TimelineRow from "../components/TimelineRow"

import { useWeb3React } from '@web3-react/core';

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
    return (<Stack mt='6' spacing='3'>
      <Heading size='md' as='h3'>
        <Link href={`/proposals/${proposal.id}?chainId=${chainId}`}>
          {proposal.title}
        </Link>
        <Badge variant="solid" direction='row' ml='1'>
          {proposalStatus(parseInt(proposal.state))}
        </Badge>

      </Heading>

      <Stat>
        <StatLabel>ID</StatLabel>
        <StatHelpText>{proposal.id}</StatHelpText>
        <StatLabel>ipfs ID</StatLabel>
        <StatHelpText><a href={`${ipfs.httpGateway}${proposal.hash}`}>{proposal.hash}</a></StatHelpText>
      </Stat>
    </Stack >
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


  const ProposalVotingTimeline = ({ proposal }) => {
    console.log(101, proposal);

    if (!proposal.votes) {
      return
    }
    // const deadline = await coderDao.proposalDeadline(proposalId);
    //     let logs = await connection.send('eth_getLogs', [{
    //     address: [
    //         coderDaoContract.address,
    //     ],
    //     fromBlock: "0x0",
    //     topics: [
    //         [ // topic[0]
    //             coderDaoContract.filters.ProposalCreated().topics[0],
    //             coderDaoContract.filters.ProposalExecuted().topics[0],
    //             coderDaoContract.filters.ProposalCanceled().topics[0],
    //             coderDaoContract.filters.ProposalQueued().topics[0],
    //             coderDaoContract.filters.ProposalVerified().topics[0],
    //             coderDaoContract.filters.ProposalMerged().topics[0],
    //             coderDaoContract.filters.ProposalContributionLodged().topics[0],
    //         ]
    //     ]
    // }]);

    // let logCreated = logs.find(log => log.name === "ProposalCreated")
    // if (logCreated) {
    //   let logActive = {
    //     "blockNumber": logCreated.args.startBlock,
    //     "name": "ProposalActive",
    //   }

    //   return logActive
    // }

    return (
      <div>

      </div>
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

  return <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
    <ProposalHead proposal={proposal} proposalState={proposalState} />
    <ProposalVotingTimeline proposal={proposal} />
  </Box>;
}
