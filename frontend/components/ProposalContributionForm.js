import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Contract, providers, utils } from 'ethers';
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

import { coderdao, daoAddress } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import { proposalStatus } from '../utils';

export default function ({ proposal, detectedContributions }) {
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();
  const [submittedContribution, setSubmittedContribution] = useState(null);
  const [blockchainValidation, setBlockchainValidation] = useState({ result: 'unverified' });
  const { account, chainId, library } = useWeb3React();

  const submitContributionToBlockchain = async (formData, coderDaoContract) => {
    const matched = formData.pullRequestUrl.match(coderdao.pullRequestRegex);
    console.error(999, "submitContributionToBlockchain", matched, proposal)
    const slugs = formData.pullRequestUrl.split('/');
    console.error(98899, slugs, slugs[slugs.length - 1], detectedContributions)
    const lastAttemptNumber = detectedContributions.length;

    // The Contract object
    const response = await coderDaoContract.lodgeContribution(
      proposal.content.contract.targets,
      proposal.content.contract.values,
      [proposal.content.contract.transferCalldata],
      utils.id(proposal.content.title),
      proposal.hash,
      utils.id(proposal.content.githubRepoUrl),
      slugs[slugs.length - 1],
      coderdao.proposalVersion,
      lastAttemptNumber + 1
    );
    return response;
  };

  const onSubmit = async (formData) => {
    const lib = await library;

    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());
    const txnResult = await submitContributionToBlockchain(formData, coderDaoContract);
    setSubmittedContribution(txnResult);
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

  // Either succeeded or queued
  // TODO: refactor this
  const canContribute = proposal.state === 4
  || proposal.state === 5;

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
        {detectedContributions.length > 0 && 
          <Box>Contribution detected, attempted times: {detectedContributions.length}</Box>
        }
        { !canContribute && <Box
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
                {...register('pullRequestUrl', { required: true, pattern: coderdao.pullRequestRegex })}
              />
              {errors.pullRequestUrl && <span>Pull Request URL is required and must be in the format of: https://github.com/$USER/$REPO/pull/$PULL_REQUEST_NUMBER </span>}
            </Box>
            <Box px={2} ml="auto">
              <Button>
                Contribute
              </Button>
            </Box>
          </Flex>
        </Box>}
      </Card>
    </Box>
  );
}
