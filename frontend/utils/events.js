import { BigNumber, utils } from 'ethers';
import { daoTokenAddress } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';
import { daoAddress, targetNetworkId } from '../constants';
import { Contract, providers } from 'ethers';

const GetEvent = async (proposal, eventFilter, coderDaoContract) => {

    let logs = await coderDaoContract.queryFilter(await eventFilter(), 0, 'latest')
    logs = logs.filter(x => x.args[0].toHexString() === proposal.id);
    if (logs.length == 0) {
        return;
    }

    const tx = await logs[0].getTransaction();

    const events = logs.map((log) => coderDaoContract.interface.parseLog(log));

    console.log(102, events);

    return {
        "name": logs[0].event,
        "blockNumber": logs[0].blockNumber,
    }
}
module.exports.GetEvent = GetEvent;

const GetProposalEvents = async (proposal, connection, coderDaoContract) => {
    const logToEvent = (log) => {
        const blockNumber = log.blockNumber
        const isValid = !log.removed
        log = coderDaoContract.interface.parseLog(log);
        log.blockNumber = BigNumber.from(blockNumber)
        log.isValid = isValid
        return log
    }
    const buildActiveEvent = (logs) => {
        let logCreated = logs.find(log => log.name === "ProposalCreated")
        if (logCreated) {
            let logActive = {
                "blockNumber": logCreated.args.startBlock,
                "name": "ProposalActive",
            }

            return logActive
        }
        return;
    }

    let logs = await connection.send('eth_getLogs', [{
        address: [
            coderDaoContract.address,
        ],
        fromBlock: "0x0",
        topics: [
            [ // topic[0]
                coderDaoContract.filters.ProposalCreated().topics[0],
                coderDaoContract.filters.ProposalExecuted().topics[0],
                coderDaoContract.filters.ProposalCanceled().topics[0],
                coderDaoContract.filters.ProposalQueued().topics[0],
                coderDaoContract.filters.ProposalVerified().topics[0],
                coderDaoContract.filters.ProposalMerged().topics[0],
                coderDaoContract.filters.ProposalContributionLodged().topics[0],
            ]
        ]
    }]);
    logs = logs.map(logToEvent);
    logs = logs.filter(x => x.args[0].toHexString() === proposal.id && x.isValid);
    logs.push(buildActiveEvent(logs))
    logs.sort((a, b) => a.blockNumber.sub(b.blockNumber).toString())
    console.log("GetProposalEvents", logs, proposal)
    return logs
}


module.exports.GetProposalEvents = GetProposalEvents;