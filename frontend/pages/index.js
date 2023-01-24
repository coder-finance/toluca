import { Box, Heading, Link, Button } from '@chakra-ui/react'
import dynamic from "next/dynamic";
import { useRouter } from 'next/router'

const DynamicHomeGallery = dynamic(() => import("../components/HomeGallery"), {
  ssr: false,
  loading: () => <p>loading...</p>,
});

function HomePage(props) {
  const router = useRouter()
  return (
    <Box>
      <Button p='5' colorScheme='pink' onClick={() => router.push('/proposals/propose')}>Propose New</Button>
      <Heading as="h1" mt='5' mb='3'>Proposal Gallery</Heading>
      <DynamicHomeGallery />
    </Box>
  );
}

export default HomePage;
