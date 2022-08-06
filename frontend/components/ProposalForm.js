import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Contract, providers, utils } from 'ethers';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Card,
  Flex,
  Button,
  Heading,
  Text
} from 'rebass';

import {
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox,
} from '@rebass/forms';

import { useWeb3React } from '@web3-react/core';

import { daoAddress } from '../constants';
import coderDaoAbi from '../abis/CoderDAO.json';

const connection = new providers.InfuraProvider('ropsten');

const ipfsLookup = async (hash, setProposalIPFSPath) => {
  setProposalIPFSPath(`http://localhost:8080/ipfs/${hash}`);
};

export default function () {
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();
  const [proposalIPFSPath, setProposalIPFSPath] = useState();
  const [value, setValue] = useState();
  const [markdownBody, setMarkdownBody] = useState('# h1');
  const { account, library } = useWeb3React();

  const onSubmit = (data) => console.log(data);

  const ipfsLookupFn = async () => {
    ipfsLookup('QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B', setProposalIPFSPath);
  };

  useEffect(() => {
    ipfsLookupFn();
  }, [proposalIPFSPath]);

  const ProposalRetrievalFn = async () => {
    if (account) {
      const lib = await library;

      // The Contract object
      const coderDao = new Contract(daoAddress, coderDaoAbi, connection);
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
        <Box
          as='form'
          onSubmit={handleSubmit(onSubmit)}
          py={3}>
          <Flex mx={-2} mb={3}>
            <Box width={1/2} px={2}>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                name='title'
                {...register('title', { required: true })} 
              />
              {errors.exampleRequired && <span>This field is required</span>}
            </Box>
            <Box width={1/2} px={2}>
              <Label htmlFor='category'>Category</Label>
              <Select
                id='category'
                name='category'
                defaultValue='Feature Request'>
                <option>Feature Request</option>
                <option>Bug Fix</option>
                <option>Improvement</option>
              </Select>
            </Box>
          </Flex>
              <ReactMarkdown>{markdownBody}</ReactMarkdown>
          <Flex mx={-2} flexWrap='wrap'>
            <Label width={[1, 1]} p={2}>
              <Textarea value={markdownBody} onChange={(e) => setMarkdownBody(e.target.value)}></Textarea>
            </Label>
          </Flex>
          <Flex mx={-2} flexWrap='wrap'>
            <Label width={[1, 1]} p={2}>
              <Checkbox
                id='agree'
                name='agree'
              />
              I agree to the coderDAO terms and conditions and code of conduct.
            </Label>
            <Box px={2} ml='auto'>
              <Button>
                Beep
              </Button>
            </Box>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
}
