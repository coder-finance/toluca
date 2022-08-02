import { Heading, Text, Link, Button } from "rebass";
import { Flex, Box as FlexBox } from "reflexbox";
import useSWR from "swr";
import Proposal from "../components/Proposal";


const gallery = [
  {
    name: "Running any NPM package in the browser locally",
    description: "JavaScript has never had any official solution for distributing packages, and every web platform (Rails, Django etc) has their own idea of how to structure and package JavaScript. In the last few years NPM has started becoming the canonical way of distribution, with Webpack as the build system, but there’s no way to load NPM packages in the browser without a server-side component.",
    image: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B", // "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
    meta: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B meta", // "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/other"
  },
  {
    name: "Eating donuts is good for your health D'OH",
    description: "This is a good example of how decoupling two system (the module system and the dependency system) gives us greater flexibility even though we’re always going to use them together. By decoupling them we have clearly defined what the module system needs to function. After careful consideration we found a way to cache this in the most performant way.",
    image: "QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP",
    meta: "https://ipfs.infura.io/ipfs/QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP/other"
  },
  // {
  //   name: "godlydev",
  //   description: "{}",
  //   image: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B", // "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
  //   meta: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B meta", // "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/other"
  // },
  // {
  //   name: "hk",
  //   description: "hong kong night time",
  //   image: "QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP",
  //   meta: "https://ipfs.infura.io/ipfs/QmdwDWXtJS5QvTXy7QoGAAUvTFY4Hhpo2nxmeU2v1MVXLP/other"
  // },
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
        gallery.map((n, i) => (
          <FlexBox width={[1, 1 / 2]} p={3}>
            <Link href={`/proposals/${i}`}>
            <Proposal proposal={n} previewOnly={true} /></Link>
          </FlexBox>
        ))}
    </Flex>
  );
};

export default HomeGallery;