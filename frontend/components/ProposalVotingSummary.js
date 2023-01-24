import {
  Card,
  CardBody,
  Badge,
  Box,
  Flex,
  Heading,
  Link,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';


export default function ({ proposal }) {

  if (!proposal || !proposal.votes) return (<>Loading...</>);

  return <Card maxW='lg' shadow='md' m='5'>
    <CardBody>
      <StatGroup>
        <Stat>
          <StatLabel>For</StatLabel>
          <StatNumber>
            {proposal.votes.for}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Against</StatLabel>
          <StatNumber>{proposal.votes.against}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Abstain</StatLabel>
          <StatNumber>{proposal.votes.abstain}</StatNumber>
        </Stat>
      </StatGroup>
    </CardBody>
  </Card >;
}
