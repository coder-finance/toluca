const { ethers, upgrades } = require("hardhat");
const assert = require('assert');
const { GovernorHelper } = require('./helpers/governance');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

describe("CoderDAO", function () {
  const name = 'CoderDAO';

  before('get factories', async function () {
    this.dao = await ethers.getContractFactory("CoderDAO");
    this.token = await ethers.getContractFactory("CoderDAOToken");
    this.daoV2 = await ethers.getContractFactory("CoderDAOV2");
  })

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const [ owner, proposer, voter1, voter2, voter3, voter4, teamAddress ] = await ethers.getSigners();
      const empty = web3.utils.toChecksumAddress(web3.utils.randomHex(20));
      
      const token_instance = await upgrades.deployProxy(this.token, {kind: 'uups'});
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address]);
      assert(await instance.name() === name);
      
      const helper = new GovernorHelper(instance);
      const tokenSupply = web3.utils.toWei('100');
      await token_instance.mint(owner, tokenSupply);
      await helper.delegate({ token: token_instance, to: voter1, value: web3.utils.toWei('10') }, { from: owner });
      await helper.delegate({ token: token_instance, to: voter2, value: web3.utils.toWei('7') }, { from: owner });
      await helper.delegate({ token: token_instance, to: voter3, value: web3.utils.toWei('5') }, { from: owner });
      await helper.delegate({ token: token_instance, to: voter4, value: web3.utils.toWei('2') }, { from: owner });
      
      /*const proposal = helper.setProposal([
              {
                  target: this.receiver.address,
                  data: this.receiver.contract.methods.mockFunction().encodeABI(),
                  value,
                },
            ], '<proposal description>');*/
  
      const grantAmount = web3.utils.toWei('50');
      const transferCalldata = token.interface.encodeFunctionData('transfer', [teamAddress, grantAmount]);
      
      await governor.propose(
          [token_instance.address],
          [0],
          [transferCalldata],
          "Proposal #1: Give grant to team",
        );
             
      // Testing voting
      assert(await instance.hasVoted(proposal.id, owner) === false);
      assert(await instance.hasVoted(proposal.id, voter1) === false);
      assert(await instance.hasVoted(proposal.id, voter2) === false);
      assert(await web3.eth.getBalance(instance.address) === value);
      assert(await web3.eth.getBalance(teamAddress) === '0');

      // Run proposal
      const txPropose = await this.helper.propose({ from: proposer });

    expectEvent(
      txPropose,
      'ProposalCreated',
      {
        proposalId: this.proposal.id,
        proposer,
        targets: this.proposal.targets,
        // values: this.proposal.values,
        signatures: this.proposal.signatures,
        calldatas: this.proposal.data,
        startBlock: new BN(txPropose.receipt.blockNumber).add(votingDelay),
        endBlock: new BN(txPropose.receipt.blockNumber).add(votingDelay).add(votingPeriod),
        description: this.proposal.description,
      },
    );

    await this.helper.waitForSnapshot();

    expectEvent(
      await this.helper.vote({ support: Enums.VoteType.For, reason: 'This is nice' }, { from: voter1 }),
      'VoteCast',
      {
        voter: voter1,
        support: Enums.VoteType.For,
        reason: 'This is nice',
        weight: web3.utils.toWei('10'),
      },
    );

    expectEvent(
      await this.helper.vote({ support: Enums.VoteType.For }, { from: voter2 }),
      'VoteCast',
      {
        voter: voter2,
        support: Enums.VoteType.For,
        weight: web3.utils.toWei('7'),
      },
    );

    expectEvent(
      await this.helper.vote({ support: Enums.VoteType.Against }, { from: voter3 }),
      'VoteCast',
      {
        voter: voter3,
        support: Enums.VoteType.Against,
        weight: web3.utils.toWei('5'),
      },
    );

    expectEvent(
      await this.helper.vote({ support: Enums.VoteType.Abstain }, { from: voter4 }),
      'VoteCast',
      {
        voter: voter4,
        support: Enums.VoteType.Abstain,
        weight: web3.utils.toWei('2'),
      },
    );

    await this.helper.waitForDeadline();

    const txExecute = await this.helper.execute();

    expectEvent(
      txExecute,
      'ProposalExecuted',
      { proposalId: this.proposal.id },
    );

    await expectEvent.inTransaction(
      txExecute.tx,
      this.receiver,
      'MockFunctionCalled',
    );

    // After
    expect(await this.mock.hasVoted(this.proposal.id, owner)).to.be.equal(false);
    expect(await this.mock.hasVoted(this.proposal.id, voter1)).to.be.equal(true);
    expect(await this.mock.hasVoted(this.proposal.id, voter2)).to.be.equal(true);
    expect(await web3.eth.getBalance(this.mock.address)).to.be.bignumber.equal('0');
    expect(await web3.eth.getBalance(this.receiver.address)).to.be.bignumber.equal(value); 
    
    });
    
    it("Should be able to upgrade", async function () {
      const token_instance = await upgrades.deployProxy(this.token, {kind: 'uups'});
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address]);
      const daoV2 = await upgrades.upgradeProxy(instance, this.daoV2);
      assert(await daoV2.version() === '2');
    });
  });
});