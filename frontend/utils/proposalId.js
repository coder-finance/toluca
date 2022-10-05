import { BigNumber, Contract, providers, utils } from 'ethers';

import { daoTokenAddress } from '../constants';
import coderDAOTokenAbi from '../abis/CoderDAOToken.json';


export default async function (proposal, transferCalldata, library) {
    const lib = await library;

    // TODO: Revise this, as it is currently defaulting token transfer 0
    // uint256 proposalId = hashProposal(targets, values, calldatas, keccak256(bytes(description)), keccak256(bytes(ipfsCid)));
    const targets = [daoTokenAddress];
    const values = [0];

    // condensed version for queueing end executing
    const shortProposal = [
        targets,
        values,
        [transferCalldata],
        utils.id(proposal.title),
        utils.id(proposal.hash)
    ];

    const proposalPartsEncoded = utils.defaultAbiCoder.encode(
        ['address[]', 'uint256[]', 'bytes[]', 'bytes32', 'bytes32'],
        shortProposal,
    );
    return BigNumber.from(utils.keccak256(proposalPartsEncoded));
}
