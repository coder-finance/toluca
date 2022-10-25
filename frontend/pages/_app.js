import React, { useState, useEffect } from 'react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import {
  Heading, Text, Link, Flex, Box
} from 'rebass';
import { ThemeProvider } from 'emotion-theming';
// import theme from '@rebass/preset';
import theme from './_theme'
import { useEagerConnect } from '../contexts';

import './App.css';
import { injected } from '../connectors';
import Network from '../components/core/Network';
import Connect from '../components/Connect';

let queryProvider;

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
    <ThemeProvider theme={theme}>
      <Box className="App">
        <header className="App-header">
          <Box
            sx={{
              display: 'grid',
              gridGap: 4,
              gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
            }}
          >
            <Box>
              <Flex px={2} color="white" bg="black" alignItems="center">
                <Link
                  p={2}
                  fontWeight="bold"
                  href="/"
                  sx={{
                    fontWeight: '600',
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  coder.finance
                </Link>
                <Box mx="auto" />

                <Network />
                <Connect />
              </Flex>
            </Box>
            {/* {!account ?  : <Text
              fontSize={[ 3, 4, 5 ]}
              fontWeight='bold'
              color='primary'>
              {account}
            </Text>} */}
          </Box>
          <Box>
            {props.children}
          </Box>
        </header>
      </Box>
    </ThemeProvider>
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
