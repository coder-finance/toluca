import { useState } from 'react'
import { Button, Text } from 'rebass'
import { useWeb3React } from '@web3-react/core'
import { injected } from '../connectors'

export default props => {
  const { account, activate } = useWeb3React()
  const [tried, setTried] = useState(false)

  const onClick = () => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        console.log('auth!')
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        console.log('noauth!')
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
        setTried(true)
      }
    })
  }

  return account ? (<Text
              fontSize={1}
              fontWeight='bold'
              color='white'>
              {account}
            </Text>) : (<Button
      {...props}
      sx={{
        fontSize: 1,
        textTransform: 'uppercase',
        borderRadius: 99999,
      }}
      onClick={onClick}
    >Connect</Button>)
}