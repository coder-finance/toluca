/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: "0.8.9",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    ropsten: {
      url: 'https://ropsten.infura.io/v3/2f23d44442364325a40ed89eb1b221dc',
      provider: () => new HDWalletProvider({ privateKeys: ['4776705768145a4e3c053120b01189a60d93166b65294b4f07203c39cefd358d'], providerOrUrl: 'https://ropsten.infura.io/v3/2f23d44442364325a40ed89eb1b221dc'}),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    hardhat: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true
    }
  },
  paths: {
    sources: './contracts'
  },
};
