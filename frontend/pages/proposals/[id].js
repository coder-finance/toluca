import { useState } from 'react';
import { Contract, providers, utils } from 'ethers';

import { useWeb3React } from '@web3-react/core';
import Proposal from '../../components/Proposal'
import ProposalVoteStatus from '../../components/ProposalVoteStatus';
import { daoAddress, ipfs } from '../../constants';
import coderDAOAbi from '../../abis/CoderDAO.json';

const connection = new providers.InfuraProvider('ropsten');

// This also gets called at build time
export async function getStaticProps({ params }) {

  const ProposalRetrievalFn = async () => {
    // The Contract object
    const coderDao = new Contract(daoAddress, coderDAOAbi, connection);
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
        image: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B',
        meta: `${e.args.proposalId.toString()} meta`
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

// This function gets called at build time
export async function getStaticPaths() {
  return { paths: [], fallback: true }
}

function ProposalDetails(props) {
  const onClientSide = typeof window !== 'undefined';
  const [voted, setVoted] = useState(false);

  if (onClientSide) {
    const { account } = useWeb3React();

    const checkDAO = async (account) => {
      if (account && props.proposal) {
        const coderDao = new Contract(daoAddress, coderDAOAbi, connection);
        const voted = await coderDao.hasVoted(props.proposal.id, account);
        setVoted(voted);
      }
    }

    checkDAO(account);
  }

  return (
    <>
      {voted && <ProposalVoteStatus />}
      <Proposal proposal={props.proposal} />
    </>
  );
}


export default ProposalDetails