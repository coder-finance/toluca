import Proposal from '../../components/Proposal'
import dynamic from "next/dynamic";

const DynamicVoteButton = dynamic(() => import('../../components/VoteButton'), {
  ssr: false,
});

const ProposalShowcase = ({ proposal }) => (<div>
  <Proposal proposal={proposal} />
  <DynamicVoteButton variant='primary' mr={2}>Vote</DynamicVoteButton>
</div>)

// This function gets called at build time
export async function getStaticProps() {
  const proposal = {
    name: "godlydev",
    description: "{}",
    image: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B", // "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
    meta: "QmNQUjin6asb6SqQn7Hkqqw6LfLWQhD4ZTaSmdyAxcbw4B meta", // "https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/other"
  }

  // Call an external API endpoint to get posts
  // const res = await fetch('https://.../posts')
  // const posts = await res.json()

  // // By returning { props: { posts } }, the Blog component
  // // will receive `posts` as a prop at build time
  return {
    props: {
      proposal,
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: '0' } }, // See the "paths" section below
      { params: { id: '1' } } // See the "paths" section below
    ],
    fallback: true
  };
}


export default ProposalShowcase