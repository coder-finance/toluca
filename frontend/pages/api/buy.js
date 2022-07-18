import { ethers, Wallet, Contract, utils } from 'ethers'
import { shop, asset } from '../../constants'
import cryptoDoggyAbi from '../../abis/CryptoDoggy.json'

const shopAddress = shop.address.ropsten
const assetAddress = asset.address.ropsten
const cryptoDoggyAddress = '0x7cCeF19091987024E322E929c71bb2d54e59663d' // asset.address.ropsten //'0x841890e5311E9F848893102Aa1fb7ec2DC0A57d0'

const { create: client, globSource, CID } = require('ipfs-http-client');

const host = 'http://localhost:5001'

let fileContent
let provider
let wallet

const ipfs = client(host);

(async function() {
  const id = await ipfs.id()
  console.info(`Daemon active. ID: ${id.id}`);

  // provider = new ethers.providers.InfuraProvider('ropsten', '583aa3fd29394208bee43d6d211c0762');
  provider = new ethers.providers.JsonRpcProvider('http://localhost:7545')
  wallet = new Wallet('f65e87476b0f9d905f4112cae3077b8705d3f37ea41c88cb5240ce0df2bc64cb', provider);

  const res = await wallet.getBalance();
  console.error('wallet balance', res.toString());
})()

const generateIPFSNFTMetadata = (body) => {
  const metadata = {
    blockNumber: body.blockNumber,
    ownerAddress: body.recipient,
    transactionHash: body.transactionHash,
  }

  console.error('generatingMetadata', metadata, body);
  return metadata
}

const ipfsUpload = async (metadata) => {

  const files = [{
    path: '/crypto-doggie.png',
    content: fileContent
  }, {
    path: '/details',
    content: JSON.stringify(metadata)
  }]
  
  let results = []
  for await (const result of ipfs.addAll(files)) {
    results.push(result)
  }

  return { uploaded: true, ipfs: results.map(r => r.cid.toString()) }
}

console.error(8888, assetAddress);
const awardItem = async (recipient, price, assetHash, metadataHash) => {
  const cryptoDoggy = new Contract(assetAddress, cryptoDoggyAbi, wallet);
  const gasPrice = await provider.getGasPrice();

  console.error('gasPrice:', gasPrice.toString());
  const gasLimit = await cryptoDoggy.estimateGas.awardItem(recipient, price, assetHash, metadataHash, { gasPrice });
  console.error('gasEstimate:', gasLimit.toString());

  const response = await cryptoDoggy.awardItem(recipient, price, assetHash, metadataHash, { gasLimit, gasPrice })
  console.error(7123, response)

  return { awardItem: response }
}

const transferNFT = async (req, res) => {
  const {
    body,
  } = req

  console.error(321, body);
  const payload = JSON.parse(body);
  if (!payload.recipient) {
    return res.status(400).json({ error: 'no recipient' });
  }

  const ipfsResult = await ipfsUpload(generateIPFSNFTMetadata(payload));
  console.error('ipfsHashes', ipfsResult.ipfs[0], ipfsResult.ipfs[1]);
  const award = await awardItem(payload.recipient, payload.price, ipfsResult.ipfs[0], ipfsResult.ipfs[1]);

  // Update or create data in your database
  res.status(200).json({ award, ipfs: { asset: ipfsResult.ipfs[0], metadata: ipfsResult.ipfs[1] } })
}

export default async function handler(req, res) {
  const {
    method,
  } = req
  switch (method) {
    case 'POST':
      await transferNFT(req, res);
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
