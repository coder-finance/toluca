import NFT from '../../components/NFT'
import dynamic from "next/dynamic";
import BuyButton from '../../components/BuyButton';
import { asset } from '../../constants';

const DynamicBuyButton = dynamic(() => import('../../components/BuyButton'), {
  ssr: false,
});

const NFTShowcase = ({ nft }) => (<div>
  <NFT nft={nft} />
  <DynamicBuyButton variant='primary' mr={2}>Buy</DynamicBuyButton>
</div>)

// This function gets called at build time
export async function getStaticProps() {
  const nft = {
    "name": "Ryu",
    "description": "Hadouken",
    "address": asset.address.ropsten,
    "image": "QmVoVTXvJ42VKviRfJAW8bec3NQbzEz4KVo1CLNMwxvXJP", // "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
    "meta": "QmVoVTXvJ42VKviRfJAW8bec3NQbzEz4KVo1CLNMwxvXJP meta" // "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/other"
  }

  // Call an external API endpoint to get posts
  // const res = await fetch('https://.../posts')
  // const posts = await res.json()

  // // By returning { props: { posts } }, the Blog component
  // // will receive `posts` as a prop at build time
  return {
    props: {
      nft,
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: '1' } } // See the "paths" section below
    ],
    fallback: true
  };
}


export default NFTShowcase