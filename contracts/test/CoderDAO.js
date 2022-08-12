const { ethers, upgrades } = require("hardhat");
const assert = require('assert');
const { GovernorHelper } = require('./helpers/governance');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

/**
module.exports = {
    Enum,
  ProposalState: Enum(
      'Pending',
    'Active',
    'Canceled',
    'Defeated',
    'Succeeded',
    'Queued',
    'Expired',
    'Executed',
    'Verified',
    'Merged'
  ),
  VoteType: Enum(
      'Against',
    'For',
    'Abstain',
  ),
};
**/

async function moveBlocksHardhat(amount, interval) {
  const amountHex = `0x${amount.toString(16)}` || "0x3e8";
  const intervalHex = `0x${interval.toString(16)}` || "0x1";

  // mine 1000 blocks with an interval of 1 minute
  await network.provider.send("hardhat_mine", [amountHex, intervalHex]);
  console.log(`Moved ${parseInt(amountHex, 16)} blocks for interval of ${parseInt(intervalHex, 16)}`);
}


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
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address, 1], {kind: 'uups'});
      assert(await instance.name() === name);
      

      const VOTING_START_DELAY = 420;
      const VOTING_DELAY = 45818;
      const value = web3.utils.toWei('1');
      await web3.eth.sendTransaction({ from: owner.address, to: instance.address, value });
      
      const helper = new GovernorHelper(instance);
      const tokenSupply = web3.utils.toWei('100');

      await token_instance.mint(owner.address, tokenSupply);
      // contract needs to have some to test
      await token_instance.mint(instance.address, tokenSupply);

      const startBalance = await team.getBalance();
      assert.equal(startBalance.toString(), '10000000000000000000000');

      // token holders have some voting power 
      await token_instance.mint(voter1.address, web3.utils.toWei('5'));
      // but to excersise it they need to delegate it
      assert.equal(await token_instance.delegates(voter1.address), 0);
      let delegateTx = await token_instance.connect(voter1).delegate(voter1.address);
      let delegateReceipt = await delegateTx.wait();
      assert.equal(delegateReceipt.events[0].args['delegator'], voter1.address);
      assert.equal(delegateReceipt.events[0].args['toDelegate'], voter1.address);
      assert.equal(delegateReceipt.events[0].args['fromDelegate'], '0x0000000000000000000000000000000000000000');
      console.log("Delegate", delegateReceipt.events);

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
          1,
          42069,
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
      assert.equal(await web3.eth.getBalance(instance.address), value);
      assert.equal((await team.getBalance()).toString(), startBalance.toString());

      let voteTx = await instance.connect(voter1).castVote(proposalId, 1);
      let voteReceipt1 = await voteTx.wait(1);
      await network.provider.send('evm_mine');
      const votes = await instance.proposalVotes(proposalId);
      console.log(301, votes);
      assert.equal(votes.forVotes, web3.utils.toWei('5'));

      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '1');      
      
      const descriptionHash = ethers.utils.id("Proposal #1: Give grant to team");
      await moveBlocksHardhat(VOTING_DELAY + 1, 1);
      
      // Run proposal      
      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '4');      
 
      await instance.execute(
          [token_instance.address],
          [0],
          [transferCalldata],
          descriptionHash
        );
      
      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '7'); // 'ProposalState.Executed'

      // Verify proposal 
      await instance.verify(
          [token_instance.address],
          [0],
          [transferCalldata],
          descriptionHash
        );
      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '8'); // 'ProposalState.Verified'

      // Confirm merged proposal
      await instance.confirmMerge(
          [token_instance.address],
          [0],
          [transferCalldata],
          descriptionHash
        );
      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '9'); // 'ProposalState.Merged'

      const contractAddress = await web3.eth.getBalance(instance.address);
      assert.equal(contractAddress, '1000000000000000000');
      // assert.equal((await team.getBalance()).toString(), value.add(startBalance).toString()); 
    
    });
    
    it("Should be able to upgrade", async function () {
      const token_instance = await upgrades.deployProxy(this.token, {kind: 'uups'});
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address, '1']);
      const daoV2 = await upgrades.upgradeProxy(instance, this.daoV2, {kind: 'uups'});
      assert(await daoV2.version() === '2');
    });
  });
});