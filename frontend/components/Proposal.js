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

  useEffect(() => {
    const ProposalRetrievalFn = async () => {
      if (account) {
        const lib = await library;

        // The Contract object
        const coderDao = new Contract(daoAddress, coderDAOAbi, connection);
        const state = await coderDao.state(proposal.id);
        setProposalState(state);
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
            {proposalState && `Ξ${proposalStatus(parseInt(proposalState))}`}
          </Text>
        </Box>

      </Card>
    </Box>
  );
}
