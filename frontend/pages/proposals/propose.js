import ProposalForm from '../../components/ProposalForm'
import dynamic from "next/dynamic";

// const DynamicProposeButton = dynamic(() => import('../../components/VoteButton'), {
//   ssr: false,
// });

const Propose = () => (<div>
  <ProposalForm />
  {/* <DynamicProposeButton variant='primary' mr={2}>Propose</DynamicProposeButton> */}
</div>)

export default Propose