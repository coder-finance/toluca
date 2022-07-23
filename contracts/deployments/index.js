const { ethers, upgrades } = require("hardhat")

const main = async() => {
  const [deployer] = await ethers.getSigners()
  console.log(`Deployer address: ${deployer.address}`)
  const daoFactory = await ethers.getContractFactory('CoderDAO')
  const dao = await upgrades.deployProxy(daoFactory, 
    ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    {
      gasPrice: '600000',
      initializer: 'initialize'
    })
  await dao.deployed()
  console.log(`Contract deployed @ ${dao.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed: ', error)
    process.exit(1)
  })
