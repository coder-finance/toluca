import { Box } from "rebass";
import dynamic from "next/dynamic";

const DynamicHomeGallery = dynamic(() => import("../components/HomeGallery"), {
  ssr: false,
  loading: () => <p>loading...</p>,
});

function HomePage(props) {
  return (
    <Box
      sx={{
        px: 3,
      }}
    >
      {/* <Heading as="h1" children="NFT Gallery" mb={3} fontSize={[4, 5, 6]} /> */}
      <DynamicHomeGallery />
    </Box>
  );
}

export default HomePage;
