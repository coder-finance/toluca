import { Box, Button, Flex, Link, Heading } from "rebass";
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

  return (
    <Box p={3}>
      <Flex>
        <Box
          p={3}
        >
          <Link href={`/proposals/propose`}><Button>Propose New</Button></Link>
        </Box>
      </Flex>
      <Box>
        <Heading as="h1" children="Proposal Gallery" mb={3} fontSize={[4, 5, 6]} />
        <DynamicHomeGallery />
      </Box>
    </Box>
  );
}

export default HomePage;
