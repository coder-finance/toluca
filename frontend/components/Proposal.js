import { useState, useEffect } from 'react';
import { BigNumber, Contract, providers, utils } from 'ethers';
import { useForm } from 'react-hook-form';
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
  StatLabel,
  StatHelpText,
  Text
} from '@chakra-ui/react';

import MiddleEllipsis from "react-middle-ellipsis";

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

  return <Card maxW='lg' shadow='md' m='5'>
    <CardBody>
      <Stack spacing='3'>
        <Heading size='md' as='h3'>
          <Link href={`/proposals/${proposal.id}?chainId=${chainId}`}>
            {proposal.title}
          </Link>
          <Badge variant="solid" direction='row' ml='1'>
            {proposalStatus(parseInt(proposalState))}
          </Badge>

        </Heading>

        <Stat>
          <StatLabel>ID</StatLabel>
          <StatHelpText>
            <Link href={`https://${targetNetworkId}.etherscan.io/tx/${proposal.transactionHash}`} title={proposal.id}>
              <div style={{ whiteSpace: "nowrap" }}>
                <MiddleEllipsis><span>{proposal.id}</span></MiddleEllipsis>
              </div></Link>
          </StatHelpText>
          <StatLabel>IPFS ID</StatLabel>
          <StatHelpText><a href={`${ipfs.httpGateway}${proposal.hash}`}>{proposal.hash}</a></StatHelpText>
          <StatLabel>Proposer</StatLabel>
          <StatHelpText><a href={`https://${targetNetworkId}.etherscan.io/address/${proposal.proposer}`}>{proposal.proposer}</a></StatHelpText>
        </Stat>
      </Stack >
    </CardBody>
  </Card>
}
