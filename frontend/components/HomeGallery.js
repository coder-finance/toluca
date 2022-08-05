import { useState, useEffect } from 'react';
import {
  Heading, Text, Link, Button
} from 'rebass';
import { Flex, Box as FlexBox } from 'reflexbox';
import { useWeb3React } from '@web3-react/core';
import { Contract } from 'ethers';

import Proposal from './Proposal';
import { daoAddress } from '../constants';
import coderDAOAbi from '../abis/CoderDAO.json';

function HomeGallery(props) {
  const { account, library } = useWeb3React();
  const [proposals, setProposals] = useState([]);

  const fetcher = async () => {
    if (!account) return;

    const lib = await library;

    // get from events the proposal details
    const coderDaoContract = new Contract(daoAddress, coderDAOAbi, lib.getSigner());
    const filters = await coderDaoContract.filters.ProposalCreated();
    const logs = await coderDaoContract.queryFilter(filters, 0, 'latest');
    const events = logs.map((log) => coderDaoContract.interface.parseLog(log));

    // latest state of proposal
    // const proposalInfo = await coderDaoContract.state(events[0].args.proposalId)

    setProposals(events.map((e) => ({
      id: e.args.proposalId.toString(), description: e.args.description, title: e.args.description, image: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B', meta: `${e.args.proposalId.toString()} meta`
    })));
  };

  useEffect(() => {
    fetcher();
  }, [account]);

  return (
    <Flex flexWrap="wrap">
      {proposals
        && proposals.map((n, i) => (
          <FlexBox key={i} width={[1, 1 / 2]} p={3}>
            <Link href={`/proposals/${i}`}>
              <Proposal proposal={n} previewOnly />
            </Link>
          </FlexBox>
        ))}
    </Flex>
  );
}

export default HomeGallery;
