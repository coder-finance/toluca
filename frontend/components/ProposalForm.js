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

import { coderdao, daoAddress, daoTokenAddress } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import coderDAOTokenAbi from '../abis/CoderDAOToken.json';

// TODO: make this available for different networks
const connection = new providers.InfuraProvider('ropsten');

export default function () {
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();
  const [submittedProposal, setSubmittedProposal] = useState(null);
  const [blockchainValidation, setBlockchainValidation] = useState({ result: 'unverified' });
  const [markdownBody, setMarkdownBody] = useState('# Proposal Title');
  const { account, chainId, library } = useWeb3React();

  const submitProposalToBackend = async (data) => {
    if (!account) {
      console.error('account is undefined, returning...');
      return;
    }

    const payload = { ...data, version: coderdao.version, initiator: account };

    const response = await fetch('/api/propose', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const txnResult = await response.json();
    return txnResult;
  };

  const submitProposalToBlockchain = async (proposal, ipfsHash, coderDaoContract) => {
    // The Contract object
    const response = await coderDaoContract.propose(
      proposal.contract.targets,
      proposal.contract.values,
      [proposal.contract.transferCalldata],
      proposal.votingDelay,
      proposal.votingPeriod,
      proposal.title,
      ipfsHash,
      coderdao.proposalVersion
    );
    return response;
  };

  const onSubmit = async (formData) => {
    if (markdownBody.length <= 0) return;

    const lib = await library;

    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
    const tokenContract = new Contract(daoTokenAddress[chainId], coderDAOTokenAbi, lib.getSigner());
    const transferCalldata = tokenContract.interface.encodeFunctionData('transfer', ['0x1D5c57053e306D97B3CA014Ca1deBd2882b325eD', 1]);

    // TODO: Revise this, as it is currently defaulting token transfer 0
    const targets = [daoTokenAddress];
    const values = [0];

    const result = await ProposalCheckFn(formData, coderDaoContract);
    setBlockchainValidation(result);

    const data = { ...formData, contract: { targets, values, transferCalldata }, body: markdownBody };
    const res = await submitProposalToBackend(data);

    const txnResult = await submitProposalToBlockchain(data, res.ipfs, coderDaoContract);
    setSubmittedProposal(res);
  };

  const ProposalCheckFn = async (proposal, coderDaoContract) => {
    const lib = await library;

    // check for duplicates
    const filters = await coderDaoContract.filters.ProposalCreated();
    const logs = await coderDaoContract.queryFilter(filters, 0, 'latest');
    const events = logs.map((log) => coderDaoContract.interface.parseLog(log));

    const duplicate = events.map((e) => (e.args.description === proposal.title)).includes(true);

    if (duplicate) return { result: 'error', error: 'duplicateEntry' };
    return { result: 'ok' };
  };

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
            <Box width={1} px={2}>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                {...register('title', { required: true })}
              />
              {errors.title && <span>Title is required</span>}
            </Box>
            <Box width={1} px={2}>
              <Label htmlFor="title">Github Repository URL</Label>
              <Input
                id="githubRepoUrl"
                name="githubRepoUrl"
                defaultValue="https://github.com/coder-finance/demo-dao"
                type="url"
                {...register('githubRepoUrl', { required: true })}
              />
              {errors.githubRepoUrl && <span>Github Repository URL is required</span>}
            </Box>
            <Box width={1} px={2}>
              <Label htmlFor="title">Github Repository Owner Username</Label>
              <Input
                id="githubRepoOwner"
                name="githubRepoOwner"
                defaultValue="coder-finance"
                {...register('githubRepoOwner', { required: true })}
              />
              {errors.githubRepoOwner && <span>Github Repository Owner is required</span>}
            </Box>
            <Box width={1} px={2}>
              <Label htmlFor="title">Github Repository Name</Label>
              <Input
                id="githubRepoName"
                name="githubRepoName"
                defaultValue="demo-dao"
                {...register('githubRepoName', { required: true })}
              />
              {errors.githubRepoName && <span>Github Repository Name is required</span>}
            </Box>
            <Box width={1} px={2}>
              <Label htmlFor="title">Github App Installation ID^</Label>
              <Input
                id="githubAppInstallationId"
                name="githubAppInstallationId"
                defaultValue="29084972"
                type="number"
                {...register('githubAppInstallationId', { required: true })}
              />
              {errors.githubAppInstallationId && <span>Github App Installation ID is required</span>}
            </Box>
          </Flex>
          <Flex mx={-2} mb={3}>
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
              <Label htmlFor="votingDelay">Voting Delay</Label>
              <Input
                id="votingDelay"
                name="votingDelay"
                defaultValue="1"
                type="number"
                min="1"
                max="42069"
                {...register('votingDelay', { required: true })}
              />
              {errors.votingDelay && <span>Voting Delay is required</span>}
            </Box>
            <Box width={1 / 2} px={2}>
              <Label htmlFor="votingPeriod">Voting Period</Label>
              <Input
                id="votingPeriod"
                name="votingPeriod"
                defaultValue="10"
                type="number"
                min="10"
                max="42069"
                {...register('votingPeriod', { required: true })}
              />
              {errors.votingPeriod && <span>Voting Period is required</span>}
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
            <Label width={[1, 1]} p={2}>
              ^ This should be moved to backend detected
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
