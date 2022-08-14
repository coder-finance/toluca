import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass';

import Proposal from '../../components/Proposal'
import { useWeb3React } from '@web3-react/core'


// This also gets called at build time
export async function getStaticProps({ params }) {


  // if (!account) return;
  // const lib = await library;

  // const coderDaoContract = new Contract(daoAddress, coderDAOAbi, lib.getSigner());
  // const filters = await coderDaoContract.filters.ProposalCreated();
  // const logs = await coderDaoContract.queryFilter(filters, 0, 'latest');
  // const events = logs.map((log) => coderDaoContract.interface.parseLog(log));

  // const proposal = events.find((x) => x.args.proposalId === params.id);

  // // Pass post data to the page via props
  // return {
  //   props: {
  //     proposal: {
  //       id: proposal.args.proposalId.toString(), description: proposal.args.description, title: proposal.args.description, image: 'QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B', meta: `${proposal.args.proposalId.toString()} meta`
  //     }
  //   }
  // }

  return {
    props: {
      proposal: {
        id: "111162238613247263521017514605817310637168262797987317335027259795845510596938", description: "Reinstall monarchy in Perm -WITH- QmRZLqq8Fp7hxS26rY1VxxZzhTzCehDJtdHtCrs3WGogEY", title: "Reinstall monarchy in Perm -WITH- QmRZLqq8Fp7hxS26rY1VxxZzhTzCehDJtdHtCrs3WGogEY", image: 'QmRZLqq8Fp7hxS26rY1VxxZzhTzCehDJtdHtCrs3WGogEY', meta: `00 meta`
      }
    }
  }
}

// This function gets called at build time
export async function getStaticPaths() {
  return { paths: [], fallback: true }
}

function ProposalDetails(props) {
  return (
    <Box p={3}>
      <Proposal proposal={props.proposal} />
    </Box>
  );
}


export default ProposalDetails