import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass';

import { Contract, providers, utils } from 'ethers';

import Proposal from '../../components/Proposal'
import { daoAddress, ipfs as ipfsAddr } from '../../constants';
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
      // TODO: fix this once we update the contract
      const indexSeparator = e.args.description.indexOf(' -WITH- ');
      console.error('index@:', indexSeparator);
      const title = e.args.description.substring(0, indexSeparator);
      console.error('title:', title);
      const hash = e.args.description.substring(indexSeparator + 8);
      console.error('hash:', hash);

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

    const res = await fetch(`http://127.0.0.1:7090/ipfs/${proposalBase.hash}`);
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