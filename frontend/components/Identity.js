import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'

import { targetNetworkId } from '../constants';

export default function (props) {
  return <Link as={NextLink} href={`https://${targetNetworkId}.etherscan.io/address/${props.address}`} isExternal>{props.address}</Link>;
}
