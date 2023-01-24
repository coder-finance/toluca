import { useState } from 'react';
import { Tag, Button } from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core';
import { injected } from '../connectors';

export default function (props) {
  const { account, activate } = useWeb3React();
  const [tried, setTried] = useState(false);

  const onClick = () => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        console.log('auth!');
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        console.log('noauth!');
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
        setTried(true);
      }
    });
  };

  return account ? (
    <Tag size='lg' colorScheme='purple' variant='outline'>
      {account}
    </Tag>
  ) : (
    <Button
      {...props}
      sx={{
        fontSize: 1,
        textTransform: 'uppercase',
        borderRadius: 99999,
      }}
      onClick={onClick}
    >
      Connect
    </Button>
  );
}
