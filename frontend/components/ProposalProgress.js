import { useEffect } from 'react';
import {
  Box,
  Card,
  Text,
} from 'rebass';
import { Box as FlexBox } from 'reflexbox';
import { Contract, providers } from 'ethers';
import { useWeb3React } from '@web3-react/core';

import coderDAOAbi from '../abis/CoderDAO.json';
import { daoAddress } from '../constants';

const connection = new providers.InfuraProvider('ropsten');

const ProposalProgress = ({ proposal }) => {
  const { account } = useWeb3React();

  // Only gets called when previewing (client-side)
  useEffect(() => {
    const ProposalRetrievalFn = async () => {
      if (account) {
        // The Contract object
        const coderDao = new Contract(daoAddress, coderDAOAbi, connection);
        const state = await coderDao.state(proposal.id);
      }
    };

    ProposalRetrievalFn();
  }, []);

  return (
    <Card
      sx={{
        p: 1,
        borderRadius: 2,
        boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
      }}
    >
      <FlexBox width={[1 / 2]} p={1}>
        <Box>
          <Text fontSize={4}>{proposal.id}</Text>
        </Box>
        <Box>
          <Text fontSize={0}>Proposed by: 0x0000</Text>
          <Text fontSize={0}>Created</Text>
          <Text fontSize={0}>Queued</Text>
          <Text fontSize={0}>Executed</Text>
          <Text fontSize={0}>Verified</Text>
          <Text fontSize={0}>Merged</Text>
          <Text fontSize={0}>Paid out to: 0x0000</Text>
        </Box>
      </FlexBox>
    </Card>
  )
};

export default ProposalProgress;
