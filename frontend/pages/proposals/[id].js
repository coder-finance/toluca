import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass';

import { Contract, providers, utils } from 'ethers';
import { useWeb3React } from '@web3-react/core'

import Proposal from '../../components/Proposal'
import { daoAddress } from '../../constants';
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
  
    const proposals = events.map((e) => ({
      id: e.args.proposalId.toHexString(),
      description: e.args.description,
      title: e.args.description,
      image: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B',
      meta: `${e.args.proposalId.toString()} meta`
    })).filter((e) => e.id === params.id);

    const proposalBase = proposals[0];
    const state = await coderDao.state(proposalBase.id);
    const votes = await coderDao.proposalVotes(proposalBase.id);
    const snapshot = await coderDao.proposalSnapshot(proposalBase.id);
    const deadline = await coderDao.proposalDeadline(proposalBase.id);

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
  // Pass post data to the page via props
  // return {
  //   props: {
  //     proposal: {
  //       id: proposal.args.proposalId.toString(), description: proposal.args.description, title: proposal.args.description, image: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B', meta: `${proposal.args.proposalId.toString()} meta`
  //     }
  //   }
  // }
  return (
    <Box p={3}>
      <Proposal proposal={props.proposal} />
    </Box>
  );
}


export default ProposalDetails