import { ethers, Wallet, Contract, utils } from 'ethers'
import { shop, asset, ipfs } from '../../constants'
import coderDAOAbi from '../../abis/CoderDAO.json'

const assetAddress = asset.address.ropsten

const { create: client, globSource, CID } = require('ipfs-http-client');

let fileContent
let provider
let wallet

const ipfs = client(ipfs.host);

(async function() {
  const id = await ipfs.id()
  console.info(`Daemon active. ID: ${id.id}`);

  provider = new ethers.providers.InfuraProvider('ropsten', '583aa3fd29394208bee43d6d211c0762');
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
  const cryptoDoggy = new Contract(assetAddress, coderDAOAbi, wallet);
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
