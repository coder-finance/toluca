const { ethers, upgrades } = require("hardhat");
const assert = require('assert');

describe("CoderDAO", function () {
  const name = 'CoderDAO';

  before('get factories', async function () {
    this.dao = await ethers.getContractFactory("CoderDAO");
    this.token = await ethers.getContractFactory("CoderDAOToken");
    this.daoV2 = await ethers.getContractFactory("CoderDAOV2");
  })

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const token_instance = await upgrades.deployProxy(this.token, {kind: 'uups'});
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address]);
      assert(await instance.name() === name);
    });
    
    it("Should be able to upgrade", async function () {
      const token_instance = await upgrades.deployProxy(this.token, {kind: 'uups'});
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address]);
      const daoV2 = await upgrades.upgradeProxy(instance, this.daoV2);
      assert(await daoV2.version() === '2');
    });
  });
});