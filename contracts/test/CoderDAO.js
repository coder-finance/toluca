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
    it("Should go through happy path", async function () {
      const [owner, proposer, voter1, voter2, voter3, voter4, team, contributor1] = await ethers.getSigners();

      const token_instance = await upgrades.deployProxy(this.token, { kind: 'uups' });
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address, 1], { kind: 'uups' });
      assert(await instance.name() === name);


      const VOTING_START_DELAY = 420;
      const VOTING_DELAY = 45818;
      const value = web3.utils.toWei('1');
      await web3.eth.sendTransaction({ from: owner.address, to: instance.address, value });

      const helper = new GovernorHelper(instance);
      const tokenSupply = web3.utils.toWei('100');

      await token_instance.mint(owner.address, tokenSupply);
      const ownerStartingBalance = await token_instance.balanceOf(owner.address);
      assert.equal(ownerStartingBalance.toString(), '200000000000000000000');
      // contract needs to have some to test
      await token_instance.mint(instance.address, tokenSupply);
      const contractStartingBalance = await token_instance.balanceOf(instance.address);
      assert.equal(contractStartingBalance.toString(), '100000000000000000000');

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

      console.info(`transferCalldata: "${transferCalldata}"`);
      const proposalDesc = "Proposal #1: Give grant to team";
      const ipfsCid = "someipfshash";

      const proposalTx = await instance.propose(
        [token_instance.address],
        [0],
        [transferCalldata],
        1,
        42069,
        proposalDesc,
        ipfsCid,
        1234
      );
      console.log(proposalTx)
      const proposalReceipt = await proposalTx.wait(1);
      await network.provider.send('evm_mine');
      const proposalId = proposalReceipt.events[0].args.proposalId;
      console.log(202, proposalId.toHexString(), proposalReceipt.events);
      let proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '0');

      // **************************************************************************
      // Build proposal ID from parts
      const proposalIdHashedBYContract = await instance.hashProposal(
        [token_instance.address],
        [0],
        [transferCalldata],
        ethers.utils.id(proposalDesc),
        ethers.utils.id(ipfsCid)
      );
      console.log(105, proposalIdHashedBYContract.toHexString())
      assert(proposalIdHashedBYContract.eq(proposalId), "proposal Id hashed by the contract")

      // uint256 proposalId = hashProposal(targets, values, calldatas, keccak256(bytes(description)), keccak256(bytes(ipfsCid)));
      const shortProposal = [
        [token_instance.address],   // targets
        [0],                        // values
        [transferCalldata],         // calldatas
        ethers.utils.id(proposalDesc),
        ethers.utils.id(ipfsCid)
      ];
      const proposalPartsEncoded = ethers.utils.defaultAbiCoder.encode(
        ['address[]', 'uint256[]', 'bytes[]', 'bytes32', 'bytes32'],
        shortProposal,
      );
      const proposalIdFromPartsU256 = ethers.BigNumber.from(ethers.utils.keccak256(proposalPartsEncoded));
      assert(proposalIdFromPartsU256.eq(proposalId), "proposal Id hashed by JS")

      // **************************************************************************
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

      const descriptionHash = ethers.utils.id(proposalDesc);
      console.info(`descriptionHash: "${descriptionHash}"`);
      const ipfsHash = ethers.utils.id(ipfsCid);
      console.info(`ipfsHash: "${ipfsHash}"`);
      await moveBlocksHardhat(VOTING_DELAY + 1, 1);

      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '4');

      const repositoryId = "github.com/somerepo";
      const pullRequestNumber = 1;

      /* 
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash,
        string memory ipfsCid,
        string memory repositoryId,
        uint256 pullRequestNumber,
        uint256 ipfsPayloadVersion,
        uint256 attemptNumber
        */

      // Lodge contribution
      await instance.connect(contributor1).lodgeContribution(
        [token_instance.address],
        [0],
        [transferCalldata],
        descriptionHash,
        ipfsCid,
        repositoryId,
        pullRequestNumber,
        1,
        1
      );

      let filters = await instance.filters.ProposalContributionLodged();
      let logs = await instance.queryFilter(filters, 0, 'latest');
      assert.equal(logs.length, 1);

      assert.equal(logs[0].args.lodger, contributor1.address);

      // Execute proposal with lodged contribution
      await instance.execute(
        [token_instance.address],
        [0],
        [transferCalldata],
        descriptionHash,
        ipfsHash,
        contributor1.address,
        1
      );

      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '7'); // 'ProposalState.Executed'

      filters = await instance.filters.ProposalExecuted();
      logs = await instance.queryFilter(filters, 0, 'latest');
      assert.equal(logs.length, 1);

      let events = logs.map((log) => instance.interface.parseLog(log));
      assert.equal(ipfsCid, events[0].args.ipfsCid);

      // Verify proposal 
      await instance.verify(
        [token_instance.address],
        [0],
        [transferCalldata],
        descriptionHash,
        ipfsHash,
        contributor1.address,
        1
      );

      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '8'); // 'ProposalState.Verified'

      filters = await instance.filters.ProposalVerified();
      logs = await instance.queryFilter(filters, 0, 'latest');
      assert.equal(logs.length, 1);

      events = logs.map((log) => instance.interface.parseLog(log));
      assert.equal(ipfsCid, events[0].args.ipfsCid);

      // Confirm merged proposal
      await instance.confirmMerge(
        [token_instance.address],
        [0],
        [transferCalldata],
        descriptionHash,
        ipfsHash,
        contributor1.address,
        1
      );
      proposalState = await instance.state(proposalId);
      assert.equal(proposalState, '9'); // 'ProposalState.Merged'

      filters = await instance.filters.ProposalMerged();
      logs = await instance.queryFilter(filters, 0, 'latest');
      assert.equal(logs.length, 1);

      events = logs.map((log) => instance.interface.parseLog(log));
      assert.equal(ipfsCid, events[0].args.ipfsCid);

      const contractAddress = await web3.eth.getBalance(instance.address);
      assert.equal(contractAddress, '1000000000000000000');

      const contractEndingBalance = await token_instance.balanceOf(instance.address);
      assert.equal(contractEndingBalance.toString(), '99000000000000000000');

      const teamEndingBalance = await token_instance.balanceOf(team.address);
      assert.equal(teamEndingBalance.toString(), grantAmount);

      // assert.equal((await team.getBalance()).toString(), value.add(startBalance).toString()); 

    });

    it("Should be able to upgrade", async function () {
      const token_instance = await upgrades.deployProxy(this.token, { kind: 'uups' });
      const instance = await upgrades.deployProxy(this.dao, [token_instance.address, '1']);
      const daoV2 = await upgrades.upgradeProxy(instance, this.daoV2, { kind: 'uups' });
      assert(await daoV2.version() === '2');
    });
  });
});