import { useState, useEffect } from 'react';
import { Contract, providers, utils } from 'ethers';
import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { daoAddress } from '../constants';

// TODO: replace with proper data
import { SampleArticle, FullSample, PreviewSample } from './core/Article';

import coderDAOAbi from '../abis/CoderDAO.json';

import { create as client, urlSource } from 'ipfs-http-client';
import { shop, asset, ipfs as ipfsAddr } from '../constants';
import { proposalStatus } from '../utils';

const ipfs = client(ipfsAddr.host);

const connection = new providers.InfuraProvider('ropsten');

const ipfsLookup = async (hash, setProposalIPFSPath) => {
  setProposalIPFSPath(`http://localhost:8080/ipfs/${hash}`);
};


const ipfsDownload = async (url) => {
  const file = await ipfs.add(urlSource(url))
  console.log(file)
};

export default function ({ proposal, previewOnly }) {
  const [proposalIPFSPath, setProposalIPFSPath] = useState();
  const [proposalState, setProposalState] = useState();
  const { account, library } = useWeb3React();

  console.log("Proposal111:", proposal);

  useEffect(() => {
    console.log("aaa")
    const ipfsLookupFn = async (proposal) => {
      ipfsDownload(`http://localhost:8080/ipfs/${proposal.image}`);
      ipfsLookup(proposal.image, setProposalIPFSPath);
    };
    if (proposal) {
      console.log("IPFS lookup of a proposal (skipped for now, see comment)", proposal);
      // ipfsLookupFn(proposal); // TODO: this causes a TypeError: Failed to fetch on client side due to CORS when local dev, temporarily commenting it out
    }
  }, [proposalIPFSPath]);

  // Only gets called when previewing (client-side)
  useEffect(() => {
    if (!previewOnly) return;

    const ProposalRetrievalFn = async () => {
      if (account) {
        // The Contract object
        const coderDao = new Contract(daoAddress, coderDAOAbi, connection);
        const state = await coderDao.state(proposal.id);
        setProposalState({ state });
      }
    };
    ProposalRetrievalFn();
  }, []);

  if (!proposal) return (<>Loading...</>);

  return (
    <Box>
      <Card
        sx={{
          p: 1,
          borderRadius: 2,
          boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
        }}
      >
        <Image src={proposalIPFSPath} style={{ maxHeight: '500px' }} />

        <Box px={2}>
          <Heading as="h3">
            {proposal.title}
          </Heading>
          <Text fontSize="2">
            {proposal.id}
          </Text>
          <Text fontSize={0}>
            {proposal.description}
          </Text>
          <Text fontSize={0}>
            State: {proposal && (proposal.state || proposalState) && `Ξ${proposalStatus(parseInt(proposal.state || proposalState.state))}`}
          </Text>
          {proposal.votes && <Box>
            <Text fontSize={0}>For: {proposal.votes.for}</Text>
            <Text fontSize={0}>Against: {proposal.votes.against}</Text>
            <Text fontSize={0}>Abstain: {proposal.votes.abstain}</Text>
          </Box>}
          {proposal.snapshot && <Text fontSize={0}>Snapshot: {proposal.snapshot}</Text>}
          {proposal.deadline && <Text fontSize={0}>Deadline: {proposal.deadline}</Text>}
        </Box>

      </Card>
    </Box>
  );
}
