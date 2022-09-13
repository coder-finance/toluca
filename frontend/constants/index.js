const gallery = [
  {
    name: 'godlydev',
    description: '{}',
    image: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B', // "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
    meta: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B meta', // "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/other"
  },
  {
    name: 'hk',
    description: 'hong kong night time',
    image: 'QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP',
    meta: 'https://ipfs.infura.io/ipfs/QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP/other'
  },
];

export const asset = {
  address: {
    ropsten: '0x94e9DD18BE6C680d9D26D7D651F185f4a7df1797'
  }
};

export const shop = {
  address: {
    ropsten: '0x02b9bd2cAc9d26eD6B8dd8E409C07451bB893143'
  }
};

export const ipfs = {
  host: 'http://127.0.0.1:5001',
  httpGateway: 'http://127.0.0.1:7090/ipfs/',
};

export const proposalStub = {
  title: 'Proposal #1: Give grant to team',
  behaviour: {
    action: 'bounty',
    amount: '1',
  },
};

export default gallery;

export const NETWORK_ID_SUPPORTED = [3];

export const daoTokenAddress = '0x065311FF2451C7334BDd608e37021f238da207e0';
export const daoAddress = '0xa9500221066A4854b66B683B0853F9DC72c52e7F';
