const { ethers } = require("hardhat")

const main = async() => {
  const [deployer] = await ethers.getSigners()
  console.log(`Deployer address: ${deployer.address}`)
  const daoFactory = await ethers.getContractFactory('CoderDAO')
  const contract = await daoFactory.deploy()
  console.log(`Contract deployed @ ${contract.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed: ', error)
    process.exit(1)
  })
