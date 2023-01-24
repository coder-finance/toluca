import React, { useState, useEffect } from 'react';

import {
  ChakraProvider,
  Container,
  Flex,
  Heading,
  HStack,
} from "@chakra-ui/react"

import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { ThemeProvider } from 'emotion-theming';
// import theme from '@rebass/preset';
import theme from './_theme'
import { useEagerConnect } from '../contexts';

import './App.css';
import { injected } from '../connectors';
import Network from '../components/core/Network';
import Connect from '../components/Connect';
import ColorModeSwitcher from "../components/ColorModeSwitcher"
import Logo from "../components/Logo"
import NextChakraLink from "../components/NextChakraLink"


function App(props) {
  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  const { active, error: networkError, activate: activateNetwork } = useWeb3React();
  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkError && !active) {
      activateNetwork();
    }
  }, [triedEager, active, networkError, activateNetwork]);

  const onConnectWallet = async () => {
    // setAccount(result[0])

    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // queryProvider = new ethers.providers.JsonRpcProvider(
    //   "https://rinkeby.infura.io/v3/583aa3fd29394208bee43d6d211c0762"
    // );

    // // The Metamask plugin also allows signing transactions to
    // // send ether and pay to change state within the blockchain.
    // // For this, you need the account signer...
    // const signer = provider.getSigner();

    // console.error(9999, account, provider, signer);
    // const blockNum = await provider.getBlockNumber();
    // console.error(10029, blockNum);
    // const nwId = await provider.network.chainId;
    // console.error('network is: ', nwId);
  };

  return (
    <ChakraProvider>
      <Container maxWidth="1200px">
        <header>
          <Flex
            py={4}
            justifyContent="space-between"
            alignItems="center"
            mb={8}
          >
            <Flex justifyContent="space-between" alignItems="center">
              <nav>
                <HStack spacing={12}>
                  <NextChakraLink
                    href="/"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Logo h="1.5rem" pointerEvents="none" mr={4} />
                    <Heading size="lg">coder.finance</Heading>
                  </NextChakraLink>
                </HStack>
              </nav>
            </Flex>
            <Network />
            <Connect />
            <ColorModeSwitcher justifySelf="flex-end" />
          </Flex>
        </header>
        {props.children}
      </Container>
    </ChakraProvider>
  );
}

function Shell({ Component, pageProps }) {
  async function getLibrary(provider, connector) {
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    return prov;
  }

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App>
        <Component {...pageProps} />
      </App>
    </Web3ReactProvider>
  );
}

export default Shell;
