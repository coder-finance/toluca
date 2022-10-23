import { useState } from 'react';
import { Box, Button, Text } from 'rebass';
import { useForm } from 'react-hook-form';
import {
  Label,
  Select
} from '@rebass/forms';

import { Contract, utils } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import coderDAOAbi from '../abis/CoderDAO.json';
import { daoAddress } from '../constants';

export default function ({ proposal, detectedContributions }) {
  const {
    register, handleSubmit, watch, formState: { errors }
  } = useForm();

  const { account, chainId, library } = useWeb3React();

  const onExecute = async (formData) => {
    const lib = await library;
    const coderDaoContract = new Contract(daoAddress[chainId], coderDAOAbi, lib.getSigner());

    const ipfsHash = utils.id(proposal.hash);
    const descriptionHash = utils.id(proposal.title);
    const contribution = detectedContributions[formData.contributionId];
  
    // The Contract object
    const response = await coderDaoContract.execute(
      proposal.content.contract.targets,
      proposal.content.contract.values,
      [proposal.content.contract.transferCalldata],
      descriptionHash,
      ipfsHash,
      contribution.args.lodger,
      contribution.args.attemptNumber
    );
    return response;
  };

  const onVerify = () => {
    console.info('todo: onVerify')
  };

  const onConfirm = () => {
    console.info('todo: onConfirm')
  };

  // TODO: refactor
  if (account !== '0xce1B9e1900108Cb779699319B1E37897d1E65c2B') return null;

  return (
    <>
      <Text
        fontSize={4}
        fontWeight="bold"
      >
        Debug Panel
      </Text>
      <Box
        as="form"
        onSubmit={handleSubmit(onExecute)}
        py={3}
      >
        {detectedContributions.length > 0 ? <>
          <Label htmlFor="contributionId">Contribution ID</Label>
          <Select
            id="contributionId"
            name="contributionId"
            defaultValue="Contribution Id"
            {...register('contributionId', { required: true })}
          >
            { detectedContributions.map((c, index) => (<option value={index}>{c.args.lodger}: {c.args.attemptNumber.toString()}</option>)) }
          </Select>
          <Button
            sx={{
              fontSize: 1,
              textTransform: 'uppercase',
              borderRadius: 99999,
            }}
          >
            Execute
          </Button>
        </> : <>No contribution detected</>}
      </Box>
      <Button
        sx={{
          fontSize: 1,
          textTransform: 'uppercase',
          borderRadius: 99999,
        }}
        onClick={onVerify}
      >
        Verify
      </Button>
      <Button
        sx={{
          fontSize: 1,
          textTransform: 'uppercase',
          borderRadius: 99999,
        }}
        onClick={onConfirm}
      >
        Confirm Merge
      </Button>
    </>);
}
