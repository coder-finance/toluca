// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const DAOToken = await hre.ethers.getContractFactory("CoderDAOToken");
  const DAO = await hre.ethers.getContractFactory("CoderDAO");

  const daoTokenInstance = await upgrades.deployProxy(DAOToken, {kind: 'uups'});
  await daoTokenInstance.deployed();

  const daoInstance = await upgrades.deployProxy(DAO, [daoTokenInstance.address], {kind: 'uups'});
  await daoInstance.deployed();

  console.log("DAO deployed to:", daoInstance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
