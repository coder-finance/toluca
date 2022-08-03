/* eslint-disable import/no-extraneous-dependencies */
/* global upgrades */
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.


require('dotenv-safe').config();

const daoAddress = process.env.ADDRESS_DAO;

const hre = require('hardhat');

async function main() {
  const DAO = await hre.ethers.getContractFactory('CoderDAO');
  // get from events the proposal details
  const coderDaoContract = await DAO.attach(daoAddress);
  const filters = await coderDaoContract.filters.ProposalCreated();
  const logs = await coderDaoContract.queryFilter(filters, 0, "latest");
  const events = logs.map((log) => coderDaoContract.interface.parseLog(log));
  events.forEach(e => console.info(`[${events[0].args.proposalId.toString()}] ${events[0].args.description}`))

  // latest state of proposal
  const proposalInfo = await coderDaoContract.state(events[0].args.proposalId)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
