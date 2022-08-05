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

import cryptoDoggyAbi from '../abis/CoderDAO.json';

const connection = new providers.InfuraProvider('ropsten');

const ipfsLookup = async (hash, setProposalIPFSPath) => {
  setProposalIPFSPath(`http://localhost:8080/ipfs/${hash}`);
};

export default function ({ proposal, previewOnly }) {
  const [proposalIPFSPath, setProposalIPFSPath] = useState();
  const [owned, setOwned] = useState();
  const [value, setValue] = useState();
  const { account, library } = useWeb3React();

  if (!proposal) return (<>Loading...</>);

  const {
    title,
    image,
    address,
    description,
    meta,
  } = proposal;

  const ipfsLookupFn = async () => {
    ipfsLookup(image, setProposalIPFSPath);
  };

  useEffect(() => {
    ipfsLookupFn();
  }, [proposalIPFSPath]);

  const ProposalRetrievalFn = async () => {
    if (account) {
      const lib = await library;

      // The Contract object
      const coderDao = new Contract(daoAddress, cryptoDoggyAbi, connection);
      const daoName = await coderDao.name();
      setValue(daoName);
    }
  };

  useEffect(() => {
    ProposalRetrievalFn();
  }, [account]);

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

        { previewOnly
          ? (
            <Box px={2}>
              <Heading as="h3">
                {title}
              </Heading>
              <Text fontSize={0}>
                {description}
              </Text>
              <Text fontSize={0}>
                {value && `Ξ${value}`}
              </Text>
            </Box>
          )
          : <SampleArticle previewOnly={previewOnly} /> }
      </Card>
    </Box>
  );
}
