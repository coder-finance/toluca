import { useEffect, useState } from 'react'
import { Button } from 'rebass'
import { useWeb3React } from '@web3-react/core'
import { Contract, providers, utils } from 'ethers'
import cryptoDoggyShopAbi from '../abis/CryptoDoggyShop.json'

const cryptoDoggyShopAddress = '0x02b9bd2cAc9d26eD6B8dd8E409C07451bB893143'
const connection = new providers.InfuraProvider('ropsten', '2f23d44442364325a40ed89eb1b221dc')

export default props => {
  const { account, library } = useWeb3React()
  const [purchased, setPurchased] = useState(false);
  const [cost, setCost] = useState();
  const [transaction, setTransaction] = useState();

  const filter = {
    address: cryptoDoggyShopAddress,
    topics: [
        utils.id("Purchase(address,uint256)"),
        // utils.hexZeroPad(account, 32)
    ]
  };
  
  connection.on(filter, async (result) => {
    console.error('PURCHASED: ', result);
    setPurchased(true);

    if (purchased) return;

    setTransaction(result);
  })

  const txnFetchFn = async () => {
    if (!transaction) {
      console.error('transaction is undefined, returning...')
      return
    }

    if (!account) {
      console.error('account is undefined, returning...')
      return
    }

    const payload = { ...transaction , recipient: account, price: cost }

    const response = await fetch('/api/buy', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const txnResult = await response.json()
    console.error(9887, txnResult)

  }

  useEffect(txnFetchFn, [transaction])

  const onClick = async () => {
    const lib = await library
    const signer = lib
      .getSigner(account)

    const txCount = await signer.getTransactionCount()
    console.error('on buy', signer, txCount)

    // The Contract object
    const cryptoDoggyShop = new Contract(cryptoDoggyShopAddress, cryptoDoggyShopAbi, lib.getSigner());
    const retrievedCost = await cryptoDoggyShop.price();
    setCost(retrievedCost.toString());
    console.error(7123, retrievedCost.toString())
    const response = await cryptoDoggyShop.makePurchase({ value: retrievedCost, gasLimit: 3000000 })
    // console.error(7123, response)
  }
  return (<>
  {purchased && <p>congratulations! you now own this nft!</p>}
  <Button
    {...props}
    sx={{
      fontSize: 1,
      textTransform: 'uppercase',
      borderRadius: 99999,
    }}
    onClick={onClick}
  />
  </>)
}