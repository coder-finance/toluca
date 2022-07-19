import {useState, useEffect} from 'react'
import { Contract, providers, utils } from 'ethers'
import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'

import cryptoDoggyShopAbi from '../abis/CryptoDoggyShop.json'
import cryptoDoggyAbi from '../abis/CryptoDoggy.json'

const cryptoDoggyShopAddress = '0xA52B0cEE2954D9D6e3dA7C054DC473E4e28AD818'
const cryptoDoggyAddress = '0x4A6D387C002838c76b3fBD3112B2bF3e7b4e9228'

// const connection = new providers.InfuraProvider('ropsten')
const connection = new providers.JsonRpcProvider('http://localhost:7545')

const ipfsLookup = async (hash, setProposalIPFSPath) => {
  // setProposalIPFSPath( 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2048&q=20')
  setProposalIPFSPath( `http://localhost:8080/ipfs/${hash}`);
}

export default ({
  proposal }) =>
  {
    const [proposalIPFSPath, setProposalIPFSPath] = useState()
    const [owned, setOwned] = useState()
    const [value, setValue] = useState()
    const { account, library } = useWeb3React()

    if (!proposal) return (<>Loading...</>)

    const {
      name,
      image,
      address,
      description,
      meta,
    } = proposal

    const ipfsLookupFn = async () => {
      ipfsLookup(image, setProposalIPFSPath);
    }

    useEffect(() => {
      ipfsLookupFn()
    }, [proposalIPFSPath])

    const cryptoDoggieFn = async () => {
      if (account) {
        console.error('blah')

        const lib = await library

        // The Contract object
        const cryptoDoggy = new Contract(cryptoDoggyAddress, cryptoDoggyAbi, connection);
        const cryptoDoggyShop = new Contract(cryptoDoggyShopAddress, cryptoDoggyShopAbi, connection);
        const cost = await cryptoDoggyShop.price();
        setValue(utils.formatEther(cost))
        setOwned(await cryptoDoggy.balanceOf(account));
      }
    }

    useEffect(() => {
      cryptoDoggieFn()
    }, [account])

    return <Box>
      <Card
        sx={{
          p: 1,
          borderRadius: 2,
          boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
        }}>
        <Image src={proposalIPFSPath} />
        <Box px={2}>
          <Heading as='h3'>
            {name}
          </Heading>
          <Text fontSize={0}>
            {description}
          </Text>
          <Text fontSize={0}>
            {value && `Ξ${value}`}
          </Text>
          <Text fontSize={0}>
            {owned && `Owned: ${owned}`}
          </Text>
        </Box>
      </Card>
    </Box>}