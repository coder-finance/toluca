import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Link,
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
  
    const proposals = events.map((e) => { 
      // TODO: fix this once we update the contract
      const indexSeparator = e.args.description.indexOf(' -WITH- ');
      const title = e.args.description;
      const hash = e.args.ipfsCid;

      return ({
        id: e.args.proposalId.toHexString(),
        description: e.args.description,
        title,
        hash,
        image: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B',
        meta: `${e.args.proposalId.toString()} meta`
      })
    });

    // latest state of proposal
    setProposals(proposals);
  };

  useEffect(() => {
    fetcher();
  }, [account]);

  return (
    <Flex flexWrap="wrap">
      {proposals
        && proposals.map((proposal, i) => (
          <FlexBox key={i} width={[1, 1 / 2]} p={3}>
            <Link href={`/proposals/${proposal.id}`}>
              <Box>
                <Card
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
                  }}
                >
                  <Proposal proposal={proposal} previewOnly />
                </Card>
              </Box>
            </Link>
          </FlexBox>
        ))}
    </Flex>
  );
}

export default HomeGallery;
