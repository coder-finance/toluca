import { NETWORK_ID_SUPPORTED } from '../constants';

export const checkChainSupported = (id) => (NETWORK_ID_SUPPORTED.includes(id));
