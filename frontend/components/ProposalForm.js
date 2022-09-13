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

import { daoAddress, daoTokenAddress } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import coderDAOTokenAbi from '../abis/CoderDAOToken.json';

const connection = new providers.InfuraProvider('ropsten');

export default function () {
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();
  const [value, setValue] = useState();
  const [submittedProposal, setSubmittedProposal] = useState(null);
  const [blockchainValidation, setBlockchainValidation] = useState({ result: 'unverified' });
  const [markdownBody, setMarkdownBody] = useState('# Proposal Title');
  const { account, library } = useWeb3React();

  const submitProposalToBackend = async (data) => {
    if (!account) {
      console.error('account is undefined, returning...');
      return;
    }

    const payload = { ...data, initiator: account };

    const response = await fetch('/api/propose', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const txnResult = await response.json();
    return txnResult;
  };

  const submitProposalToBlockchain = async (proposal, ipfsHash) => {
    const lib = await library;
    const signer = lib
      .getSigner(account);

    const txCount = await signer.getTransactionCount();

    // The Contract object
    const coderDaoContract = new Contract(daoAddress, coderDAOAbi, lib.getSigner());
    const tokenContract = new Contract(daoTokenAddress, coderDAOTokenAbi, lib.getSigner());
    const transferCalldata = tokenContract.interface.encodeFunctionData('transfer', ['0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', 1]);
    const response = await coderDaoContract.propose(
      [daoTokenAddress],
      [0],
      [transferCalldata],
      proposal.votingDelay,
      proposal.votingPeriod,
      proposal.title,
      ipfsHash
    );
    return response;
  };

  const onSubmit = async (formData) => {
    if (markdownBody.length <= 0) return;

    const result = await ProposalCheckFn(formData);
    setBlockchainValidation(result);

    const data = { ...formData, body: markdownBody };
    const res = await submitProposalToBackend(data);

    const txnResult = await submitProposalToBlockchain(data, res.ipfs);
    setSubmittedProposal(res);
  };

  const ProposalCheckFn = async (proposal) => {
    const lib = await library;

    // check for duplicates
    const coderDaoContract = new Contract(daoAddress, coderDAOAbi, lib.getSigner());
    const filters = await coderDaoContract.filters.ProposalCreated();
    const logs = await coderDaoContract.queryFilter(filters, 0, 'latest');
    const events = logs.map((log) => coderDaoContract.interface.parseLog(log));

    const duplicate = events.map((e) => (e.args.description === proposal.title)).includes(true);

    if (duplicate) return { result: 'error', error: 'duplicateEntry' };
    return { result: 'ok' };
  };

  useEffect(() => {
    const ProposalRetrievalFn = async () => {
      if (account) {
        const lib = await library;

        // The Contract object
        const coderDao = new Contract(daoAddress, coderDAOAbi, connection);
        const daoName = await coderDao.name();
        setValue(daoName);
      }
    };

    ProposalRetrievalFn();
  }, [account]);

  if (submittedProposal !== null && blockchainValidation.result === 'ok') {
    return (
      <Box>
        <Card
          sx={{
            p: 1,
            borderRadius: 2,
            boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
          }}
        >
          Proposal submitted successfully:
          {' '}
          {submittedProposal.ipfs}
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
        }}
      >
        {blockchainValidation && blockchainValidation.result === 'error' && (
          <span>
            Failed to verify on blockchain, error:
            {blockchainValidation.error}
          </span>
        )}
        <Box
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          py={3}
        >
          <Flex mx={-2} mb={3}>
            <Box width={1 / 2} px={2}>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                {...register('title', { required: true })}
              />
              {errors.title && <span>Title is required</span>}
            </Box>
            <Box width={1 / 2} px={2}>
              <Label htmlFor="bounty">Bounty (Ξ)</Label>
              <Input
                id="bounty"
                name="bounty"
                type="number"
                min="0"
                max="5000"
                {...register('bounty', { required: true })}
              />
              {errors.bounty && <span>Bounty is required</span>}
            </Box>
            <Box width={1 / 2} px={2}>
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                name="category"
                defaultValue="Feature Request"
                {...register('category', { required: true })}
              >
                <option>Feature Request</option>
                <option>Bug Fix</option>
                <option>Improvement</option>
              </Select>
            </Box>
            <Box width={1 / 2} px={2}>
              <Label htmlFor="title">Voting Delay</Label>
              <Input
                id="votingDelay"
                name="votingDelay"
                defaultValue="1"
                type="number"
                min="1"
                max="42069"
                {...register('votingDelay', { required: true })}
              />
              {errors.title && <span>Voting Delay is required</span>}
            </Box>
            <Box width={1 / 2} px={2}>
              <Label htmlFor="title">Voting Period</Label>
              <Input
                id="votingPeriod"
                name="votingPeriod"
                defaultValue="10"
                type="number"
                min="10"
                max="42069"
                {...register('votingPeriod', { required: true })}
              />
              {errors.title && <span>Voting Period is required</span>}
            </Box>
          </Flex>
          <ReactMarkdown>{markdownBody}</ReactMarkdown>
          <Flex mx={-2} flexWrap="wrap">
            <Label width={[1, 1]} p={2}>
              <Textarea id="markdownBody" name="markdownBody" value={markdownBody} onChange={(e) => setMarkdownBody(e.target.value)} />
            </Label>
            {markdownBody.length <= 0 && <span>Body is required</span>}
          </Flex>
          <Flex mx={-2} flexWrap="wrap">
            <Label width={[1, 1]} p={2}>
              <Checkbox
                id="agree"
                name="agree"
              />
              I agree to the coderDAO terms and conditions and code of conduct.
            </Label>
            <Box px={2} ml="auto">
              <Button>
                Submit
              </Button>
            </Box>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
}
