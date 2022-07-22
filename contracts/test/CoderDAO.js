const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("CoderDAO", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CoderDAOContract = await ethers.getContractFactory("CoderDAO");
    const dao = await CoderDAOContract.deploy(unlockTime, { value: lockedAmount });

    return { dao, unlockTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { lock, unlockTime } = await loadFixture(deployOneFixture);

      expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { lock, owner } = await loadFixture(deployOneFixture);

      expect(await lock.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to lock", async function () {
      const { lock, lockedAmount } = await loadFixture(
        deployOneFixture
      );

      expect(await ethers.provider.getBalance(lock.address)).to.equal(
        lockedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      const latestTime = await time.latest();
      const Lock = await ethers.getContractFactory("Lock");
      await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Unlock time should be in the future"
      );
    });
  });
});


const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Enums = require('../../helpers/enums');
const { GovernorHelper } = require('../../helpers/governance');

const Token = artifacts.require('ERC20VotesCompMock');
const Governor = artifacts.require('CoderDAO');
const CallReceiver = artifacts.require('CallReceiverMock');

contract('GovernorComp', function (accounts) {
  const [owner, voter1, voter2, voter3, voter4] = accounts;

  const name = 'OZ-Governor';
  // const version = '1';
  const tokenName = 'MockToken';
  const tokenSymbol = 'MTKN';
  const tokenSupply = web3.utils.toWei('100');
  const votingDelay = new BN(4);
  const votingPeriod = new BN(16);
  const value = web3.utils.toWei('1');

  beforeEach(async function () {
    this.owner = owner;
    this.token = await Token.new(tokenName, tokenSymbol);
    this.mock = await Governor.new(name, this.token.address);
    this.receiver = await CallReceiver.new();

    this.helper = new GovernorHelper(this.mock);

    await web3.eth.sendTransaction({ from: owner, to: this.mock.address, value });

    await this.token.mint(owner, tokenSupply);
    await this.helper.delegate({ token: this.token, to: voter1, value: web3.utils.toWei('10') }, { from: owner });
    await this.helper.delegate({ token: this.token, to: voter2, value: web3.utils.toWei('7') }, { from: owner });
    await this.helper.delegate({ token: this.token, to: voter3, value: web3.utils.toWei('5') }, { from: owner });
    await this.helper.delegate({ token: this.token, to: voter4, value: web3.utils.toWei('2') }, { from: owner });

    // default proposal
    this.proposal = this.helper.setProposal([
      {
        target: this.receiver.address,
        value,
        data: this.receiver.contract.methods.mockFunction().encodeABI(),
      },
    ], '<proposal description>');
  });

  it('deployment check', async function () {
    expect(await this.mock.name()).to.be.equal(name);
    expect(await this.mock.token()).to.be.equal(this.token.address);
    expect(await this.mock.votingDelay()).to.be.bignumber.equal(votingDelay);
    expect(await this.mock.votingPeriod()).to.be.bignumber.equal(votingPeriod);
    expect(await this.mock.quorum(0)).to.be.bignumber.equal('0');
  });

  it('voting with comp token', async function () {
    await this.helper.propose();
    await this.helper.waitForSnapshot();
    await this.helper.vote({ support: Enums.VoteType.For }, { from: voter1 });
    await this.helper.vote({ support: Enums.VoteType.For }, { from: voter2 });
    await this.helper.vote({ support: Enums.VoteType.Against }, { from: voter3 });
    await this.helper.vote({ support: Enums.VoteType.Abstain }, { from: voter4 });
    await this.helper.waitForDeadline();
    await this.helper.execute();

    expect(await this.mock.hasVoted(this.proposal.id, owner)).to.be.equal(false);
    expect(await this.mock.hasVoted(this.proposal.id, voter1)).to.be.equal(true);
    expect(await this.mock.hasVoted(this.proposal.id, voter2)).to.be.equal(true);
    expect(await this.mock.hasVoted(this.proposal.id, voter3)).to.be.equal(true);
    expect(await this.mock.hasVoted(this.proposal.id, voter4)).to.be.equal(true);

    await this.mock.proposalVotes(this.proposal.id).then(results => {
      expect(results.forVotes).to.be.bignumber.equal(web3.utils.toWei('17'));
      expect(results.againstVotes).to.be.bignumber.equal(web3.utils.toWei('5'));
      expect(results.abstainVotes).to.be.bignumber.equal(web3.utils.toWei('2'));
    });
  });
});