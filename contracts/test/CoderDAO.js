const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("CoderDAO", function () {
  const name = 'CoderDAO';

  before('get factories', async function () {
    this.dao = await ethers.getContractFactory("CoderDAO");
    this.dao = await ethers.getContractFactory("CoderDAOToken");
  })

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const instance = await upgrades.deployProxy(this.dao, ['0x0']);
      await instance.deployed();

      expect(await instance.name()).to.be.equal(name);
    });
  });
});