import { Heading, Text, Link, Box } from "rebass";
import { Flex, Box as FlexBox } from "reflexbox";
import useSWR from "swr";
import NFT from "../components/NFT";


const gallery = [
  {
    name: "godlydev",
    description: "{}",
    image: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B", // "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
    meta: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B meta", // "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/other"
  },
  {
    name: "hk",
    description: "hong kong night time",
    image: "QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP",
    meta: "https://ipfs.infura.io/ipfs/QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP/other"
  },
  {
    name: "godlydev",
    description: "{}",
    image: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B", // "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
    meta: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B meta", // "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/other"
  },
  {
    name: "hk",
    description: "hong kong night time",
    image: "QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP",
    meta: "https://ipfs.infura.io/ipfs/QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP/other"
  },
];

const HomeGallery = (props) => {
  const fetcher = async () => {
    return gallery;
  };

  const { data, error } = useSWR("/api/gallery", fetcher);

  if (!gallery) {
    return null;
  }

  return (
    <Flex flexWrap="wrap">
      {gallery &&
        gallery.map((n) => (
          <FlexBox width={[1, 1 / 2]} p={3}>
            <NFT nft={n} />
          </FlexBox>
        ))}
    </Flex>
  );
};

export default HomeGallery;