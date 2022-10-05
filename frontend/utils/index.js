import { NETWORK_ID_SUPPORTED } from '../constants';
import genProposalIdFromParts from './proposalId';

export const checkChainSupported = (id) => (NETWORK_ID_SUPPORTED.includes(id));

const proposalStates = [
  'Pending',
  'Active',
  'Canceled',
  'Defeated',
  'Succeeded',
  'Queued',
  'Expired',
  'Executed',
  'Verified',
  'Merged'
];

export const proposalStatus = (state) => proposalStates.at(state) ? proposalStates[state] : `Unknown state: ${state}`;

export const genProposalId = genProposalIdFromParts;