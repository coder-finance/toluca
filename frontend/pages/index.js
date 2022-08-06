import { Box, Button } from "rebass";
import dynamic from "next/dynamic";
import { useWeb3React } from '@web3-react/core'
import { Contract, providers, utils } from 'ethers'
import { proposalStub, daoAddress, daoTokenAddress } from "../constants";
import coderDAOAbi from '../abis/CoderDAO.json'

const DynamicHomeGallery = dynamic(() => import("../components/HomeGallery"), {
  ssr: false,
  loading: () => <p>loading...</p>,
});

function HomePage(props) {
  const { account, library } = useWeb3React()

  const getEvents = async() => {
    const lib = await library

    // get from events the proposal details
    const coderDaoContract = new Contract(daoAddress, coderDAOAbi, lib.getSigner());
    const filters = await coderDaoContract.filters.ProposalCreated();
    const logs = await coderDaoContract.queryFilter(filters, 0, "latest");
    const events = logs.map((log) => coderDaoContract.interface.parseLog(log));
    console.error(777, events[0].args.proposalId.toString(), events[0].args.description)

    // latest state of proposal
    const proposalInfo = await coderDaoContract.state(events[0].args.proposalId)
    console.error(888, proposalInfo)
  }

  return (
    <Box
      sx={{
        px: 3,
      }}
    >
    {/* <Button onClick={propose}>Propose New</Button> */}
    <Button onClick={getEvents}>Events</Button>
      {/* <Heading as="h1" children="Proposal Gallery" mb={3} fontSize={[4, 5, 6]} /> */}
      <DynamicHomeGallery />
    </Box>
  );
}

export default HomePage;
