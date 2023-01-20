import { ColorModeScript } from '@chakra-ui/react'
import Document, {
  Html, Head, Main, NextScript
} from 'next/document';
import theme from '@chakra-ui/theme'
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  render() {
    const sheet = new ServerStyleSheet();
    const main = sheet.collectStyles(<Main />);
    const styleTags = sheet.getStyleElement();

    return (
      <Html>
        <Head>{styleTags}</Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <div className="root">{main}</div>
          <NextScript />
        </body>
      </Html>
    );
  }
}
