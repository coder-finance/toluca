const proposalFromLog = (coderDaoContract, log) => {
    let event = coderDaoContract.interface.parseLog(log);
    return {
        id: event.args.proposalId.toHexString(),
        description: event.args.description,
        title: event.args.description,
        hash: event.args.ipfsCid,
        proposer: event.args.proposer,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash
    }
}

exports.ProposalFromLog = proposalFromLog;