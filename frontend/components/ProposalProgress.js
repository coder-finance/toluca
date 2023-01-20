import { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Heading,
  Link,
  Stack,
  Stat,
  StatLabel,
  StatHelpText,
  Text
} from '@chakra-ui/react';
import TimelineRow from "../components/TimelineRow"

import { Contract, providers } from 'ethers';
import { useWeb3React } from '@web3-react/core';

import coderDAOAbi from '../abis/CoderDAO.json';
import { daoAddress, targetNetworkId } from '../constants';
import { GetEvent, GetProposalEvents } from '../utils/events'

const connection = new providers.InfuraProvider(targetNetworkId);

const ProposalProgress = ({ proposal }) => {
  const { account, chainId, library } = useWeb3React();
  const [proposalLog, setProposalLog] = useState();

  // Only gets called when previewing (client-side)
  const onClientSide = typeof window !== 'undefined';

  if (onClientSide) {
    useEffect(() => {
      const ProposalRetrievalFn = async () => {
        if (account) {
          const lib = await library;
          const coderDao = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
          let events = await GetProposalEvents(proposal, connection, coderDao)
          setProposalLog(events);
        }
      };

      ProposalRetrievalFn();
    }, [account]);
  }

  let rows = []
  if (proposalLog) {
    rows = proposalLog.map((log, index, arr) => <TimelineRow
      title={log.name}
      date={log.blockNumber.toString()}
      index={index}
      arrLength={arr.length}
    />
    )
  }

  return <Card p="1rem" maxHeight="100%">
    <CardHeader pt="0px" p="28px 0px 35px 21px">
      <Flex direction="column">
        <Text fontSize="lg" fontWeight="bold" pb=".5rem">
          History
        </Text>
      </Flex>
    </CardHeader>
    <CardBody ps="26px" pe="0px" mb="31px" position="relative">
      <Flex direction="column">
        {rows}
      </Flex>
    </CardBody>
  </Card>
};

export default ProposalProgress;
