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
      const [ owner, proposer, voter1, voter2, voter3, voter4, team ] = await ethers.getSigners();
          
      const token_instance = await upgrades.deployProxy(this.token, {kind: 'uups'});
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address]);
      assert(await instance.name() === name);
      

      const value = web3.utils.toWei('1');
      await web3.eth.sendTransaction({ from: owner.address, to: instance.address, value });
      
      const helper = new GovernorHelper(instance);
      const tokenSupply = web3.utils.toWei('100');

      await token_instance.mint(owner.address, tokenSupply);
      const startBalance = await team.getBalance();
      assert.equal(startBalance.toString(), '10000000000000000000000');

      await token_instance.connect(voter1).delegate(voter1.address);

      //await helper.delegate({ token: token_instance, to: voter2.address, value: web3.utils.toWei('7') }, { from: owner.address });
      //await helper.delegate({ token: token_instance, to: voter3.address, value: web3.utils.toWei('5') }, { from: owner.address });
      //await helper.delegate({ token: token_instance, to: voter4.address, value: web3.utils.toWei('2') }, { from: owner.address });
      
      /*const proposal = helper.setProposal([
              {
                  target: this.receiver.address,
                  data: this.receiver.contract.methods.mockFunction().encodeABI(),
                  value,
                },
            ], '<proposal description>');*/
  
      const grantAmount = web3.utils.toWei('1');
      const transferCalldata = token_instance.interface.encodeFunctionData('transfer', [team.address, grantAmount]);
      
      const proposalTx = await instance.propose(
          [token_instance.address],
          [0],
          [transferCalldata],
          "Proposal #1: Give grant to team",
        );
      console.log(proposalTx)
      const proposalReceipt = await proposalTx.wait(1);
      await network.provider.send('evm_mine');
      const proposalId = proposalReceipt.events[0].args.proposalId;
      console.log(202, proposalReceipt.events);
      let proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '0');
      
      // Testing voting
      assert(await instance.hasVoted(proposalId, owner.address) === false);
      assert(await instance.hasVoted(proposalId, voter1.address) === false);
      //assert(await instance.hasVoted(proposal.id, voter2.address) === false);
      console.log(101, instance.address, owner.address, team.address);
      
      assert.equal(await web3.eth.getBalance(instance.address), value);
      console.log(102)
      assert.equal((await team.getBalance()).toString(), startBalance.toString());

      let voteReceipt1 = await instance.connect(voter1).castVote(proposalId, 1);
      console.log(202, voteReceipt1.events);
      const votes = await instance.proposalVotes(proposalId);
      assert.equal(votes.forVotes, '1');
      
      // Run proposal
      /*await instance.queue(
          [token_instance.address],
          [0],
          [transferCalldata],
          descriptionHash,
        );*/
      
      await instance.execute(
          [token_instance.address],
          [0],
          [transferCalldata],
          "Proposal #1: Give grant to team",
        );
      
      assert.equal(await web3.eth.getBalance(instance.address).toString(), '0');
      assert.equal((await team.getBalance()).toString(), value.add(startBalance).toString()); 
    
    });
    
    it("Should be able to upgrade", async function () {
      const token_instance = await upgrades.deployProxy(this.token, {kind: 'uups'});
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address]);
      const daoV2 = await upgrades.upgradeProxy(instance, this.daoV2);
      assert(await daoV2.version() === '2');
    });
  });
});