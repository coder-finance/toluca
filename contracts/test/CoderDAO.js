const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

describe("CoderDAO", function () {
  const name = 'CoderDAO';

  before('get factories', async function () {
    this.dao = await ethers.getContractFactory("CoderDAO");
    this.token = await ethers.getContractFactory("CoderDAOToken");
  })

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const token_instance = await upgrades.deployProxy(this.token);
      await token_instance.deployed();
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address]);
      await instance.deployed();

      expect(await instance.name()).to.be.equal(name);
    });
  });
});