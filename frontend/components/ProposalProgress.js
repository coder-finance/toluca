import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Text,
} from 'rebass';
import { Box as FlexBox } from 'reflexbox';
import { Contract, providers } from 'ethers';
import { useWeb3React } from '@web3-react/core';

import coderDAOAbi from '../abis/CoderDAO.json';
import { daoAddress, targetNetworkId } from '../constants';

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
  
          // The Contract object
          const coderDao = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
  
          // TODO: refactor this to be DRY
          let filters = await coderDao.filters.ProposalCreated();
          const logsCreated = await coderDao.queryFilter(filters, 0, 'latest');
          const proposalCreatedEvent = logsCreated.filter(e => e.args[0].toHexString() === proposal.id);
          console.error('proposalcreated', proposal.id, proposalCreatedEvent[0].blockNumber);
          const proposalCreatedText = proposalCreatedEvent.length > 0 ? `Created on block ${proposalCreatedEvent[0].blockNumber}` : '';
          const txCreated = await proposalCreatedEvent[0].getTransaction();
  
          filters = await coderDao.filters.ProposalCanceled();
          const logsCanceled = await coderDao.queryFilter(filters, 0, 'latest');
          const proposalCancelledEvent = logsCanceled.filter(e => e.args[0].toHexString() === proposal.id).map(e => `Canceled on block #${e}`);
          console.error('proposalcanceled', proposal.id, proposalCancelledEvent);
          const proposalCancelledText = proposalCancelledEvent.length > 0 ? `Cancelled on block ${proposalCancelledEvent[0].blockNumber}` : '';
  
          filters = await coderDao.filters.ProposalExecuted();
          const logsExecuted = await coderDao.queryFilter(filters, 0, 'latest');
          const proposalExecutedEvent = logsExecuted.filter(e => e.args[0].toHexString() === proposal.id).map(e => `Executed on block #${e}`);;
          console.error('proposalexecuted', proposal.id, proposalExecutedEvent);
          const proposalExecutedText = proposalExecutedEvent.length > 0 ? `Executed on block ${proposalExecutedEvent[0].blockNumber}` : '';

          filters = await coderDao.filters.ProposalContributionLodged();
          const logsLodged = await coderDao.queryFilter(filters, 0, 'latest');
          const proposalContribLodgedEvent = logsLodged.filter(e => e.args[0].toHexString() === proposal.id);
          console.error('proposalcontriblodged', proposal.id, proposalContribLodgedEvent);
          const proposalContribLodgedText = proposalContribLodgedEvent.length > 0 ? proposalContribLodgedEvent.map(e => `Contribution Lodged by ${e.args.lodger} on block ${e.blockNumber}`)  : '';


          filters = await coderDao.filters.ProposalVerified();
          const logsVerified = await coderDao.queryFilter(filters, 0, 'latest');
          const proposalVerifiedEvent = logsVerified.filter(e => e.args[0].toHexString() === proposal.id).map(e => `Verified on block #${e}`);;
          console.error('proposalverified', proposal.id, proposalVerifiedEvent);
          const proposalVerifiedText = proposalVerifiedEvent.length > 0 ? `Verified on block ${proposalVerifiedEvent[0].blockNumber}` : '';
  
          filters = await coderDao.filters.ProposalMerged();
          const logsMerged = await coderDao.queryFilter(filters, 0, 'latest');
          const proposalMergedEvent = logsMerged.filter(e => e.args[0].toHexString() === proposal.id).map(e => `Merged on block #${e}`);;
          console.error('proposalmerged', proposal.id, proposalMergedEvent);
          const proposalMergedText = proposalMergedEvent.length > 0 ? `Merged on block ${proposalMergedEvent[0].blockNumber}` : '';
  
          setProposalLog({
            progress: [proposalCreatedText, proposalCancelledText, proposalExecutedText, ...proposalContribLodgedText,
              proposalVerifiedText, proposalMergedText], createdBy: txCreated.from
          });
        }
      };
  
      ProposalRetrievalFn();
    }, [account]);
  }

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
          {proposalLog && <Text fontSize={0}>Proposed by: {proposalLog.createdBy}</Text>}
          {proposalLog && proposalLog.progress.map(l => <Text fontSize={0}>{l}</Text>)}
        </Box>
      </FlexBox>
    </Card>
  )
};

export default ProposalProgress;
