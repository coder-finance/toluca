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

export default function () {
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();
  const [submittedContribution, setSubmittedContribution] = useState(null);
  const [blockchainValidation, setBlockchainValidation] = useState({ result: 'unverified' });
  const [markdownBody, setMarkdownBody] = useState('# Proposal Title');
  const { account, chainId, library } = useWeb3React();

  const submitContributionToBlockchain = async (formData, coderDaoContract) => {
    alert('TODO: uncomment below once contract upgraded')
   console.error(999, "submitContributionToBlockchain", formData.pullRequestUrl)
    // The Contract object
    // const response = await coderDaoContract.lodgeContribution(
    //   proposal.contract.targets,
    //   proposal.contract.values,
    //   [proposal.contract.transferCalldata],
    //   utils.id(proposal.title),
    //   utils.id(repositoryUrl),
    //   42069,
    //   1,
    //   1
    // );
    // return response;
  };

  const onSubmit = async (formData) => {
    if (markdownBody.length <= 0) return;

    const lib = await library;

    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
    const txnResult = await submitContributionToBlockchain(formData, coderDaoContract);
    setSubmittedContribution(txnResult);
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

  if (submittedContribution !== null && blockchainValidation.result === 'ok') {
    return (
      <Box>
        <Card
          sx={{
            p: 1,
            borderRadius: 2,
            boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
          }}
        >
          Contribution submitted successfully.
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
              <Label htmlFor="title">GitHub Pull Request URL</Label>
              <Input
                id="pullRequestUrl"
                name="pullRequestUrl"
                type="url"
                {...register('pullRequestUrl', { required: true })}
              />
              {errors.pullRequestUrl && <span>Pull Request URL is required</span>}
            </Box>
            <Box px={2} ml="auto">
              <Button>
                Contribute
              </Button>
            </Box>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
}
