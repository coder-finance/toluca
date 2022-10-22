import { useEffect, useState } from 'react';
import { Contract, providers, utils } from 'ethers';

import { useWeb3React } from '@web3-react/core';

import Proposal from '../../components/Proposal'
import ProposalVoteStatus from '../../components/ProposalVoteStatus';
import ProposalVoting from '../../components/ProposalVoting';
import ProposalContributionForm from '../../components/ProposalContributionForm';
import ProposalProgress from '../../components/ProposalProgress';
import DebugPanel from '../../components/DebugPanel';
import { daoAddress, ipfs, targetNetworkId } from '../../constants';
import coderDAOAbi from '../../abis/CoderDAO.json';

const connection = new providers.InfuraProvider(targetNetworkId);

// This also gets called on server side
export async function getServerSideProps({ params, query }) {
  const ProposalRetrievalFn = async () => {
    // The Contract object
    // const { chainId } = useWeb3React();
    const chainId = 5; // https://github.com/eth-clients/goerli

    const coderDao = new Contract(daoAddress[chainId], coderDAOAbi, connection);
    const filters = await coderDao.filters.ProposalCreated();
    const logs = await coderDao.queryFilter(filters, 0, 'latest');
    const events = logs.map((log) => coderDao.interface.parseLog(log));

    const proposals = events.map((e) => {
      const title = e.args.description;
      const hash = e.args.ipfsCid;

      return ({
        id: e.args.proposalId.toHexString(),
        description: e.args.description,
        title,
        hash,
      })
    }).filter((e) => e.id === params.id);

    const proposalBase = proposals[0];
    const state = await coderDao.state(proposalBase.id);
    const votes = await coderDao.proposalVotes(proposalBase.id);
    const snapshot = await coderDao.proposalSnapshot(proposalBase.id);
    const deadline = await coderDao.proposalDeadline(proposalBase.id);

    const res = await fetch(`${ipfs.httpGateway}${proposalBase.hash}`);
    const content = await res.json();

    const proposal = {
      ...proposalBase,
      state,
      votes: {
        against: utils.formatEther(votes[0]),
        for: utils.formatEther(votes[1]),
        abstain: utils.formatEther(votes[2]),
      },
      deadline: deadline.toString(),
      snapshot: snapshot.toString(),
      content,
    }

    return proposal;
  };

  const proposal = await ProposalRetrievalFn();

  return {
    props: {
      proposal
    }
  }
}

function ProposalDetails(props) {
  const onClientSide = typeof window !== 'undefined';
  const [voted, setVoted] = useState(false);
  const [detectedContributions, setDetectedContributions] = useState([]);

  if (onClientSide) {
    const { account, library, chainId } = useWeb3React();

    const checkDAO = async (account) => {
      if (account && props.proposal) {
        const coderDao = new Contract(daoAddress[chainId], coderDAOAbi, connection);
        const filters = await coderDao.filters.ProposalContributionLodged();
        const logs = await coderDao.queryFilter(filters, 0, 'latest');
        const events = logs.map((log) => coderDao.interface.parseLog(log))
          .filter((e) => e.args.proposalId.toHexString() === props.proposal.id
            && e.args.lodger === account);

        events.length > 0 && setDetectedContributions(events);
        console.error('lastAttemptNumber', events.length);
      }
    }

    useEffect(() => {
      checkDAO(account);
    }, [account]);
  }

  return (
    <>
      {voted && <ProposalVoteStatus />}
      <Proposal proposal={props.proposal} />
      <ProposalVoting proposal={props.proposal} />
      <ProposalContributionForm proposal={props.proposal} detectedContributions={detectedContributions} />
      <ProposalProgress proposal={props.proposal} />
      <DebugPanel/>
    </>
  );
}


export default ProposalDetails