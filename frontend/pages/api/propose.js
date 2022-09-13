import { create as client, globSource, CID } from 'ipfs-http-client';
import { ipfs as ipfsAddr } from '../../constants';

const ipfs = client(ipfsAddr.host);

const ipfsUpload = async (data) => {
  const files = [
    {
      path: '/details',
      content: JSON.stringify(data)
    }];

  const results = [];
  for await (const result of ipfs.addAll(files)) {
    results.push(result);
  }

  return { uploaded: true, ipfs: results.map((r) => r.cid.toString()) };
};

const propose = async (req, res) => {
  const {
    body,
  } = req;

  const payload = JSON.parse(body);

  const id = await ipfs.id();
  console.info(`Found IPFS node. ID: ${id.id}`);

  const ipfsResult = await ipfsUpload(payload);
  res.status(200).json({ result: 'ok', ipfs: ipfsResult.ipfs[0] });
};

export default async function handler(req, res) {
  const {
    method,
  } = req;
  switch (method) {
    case 'POST':
      await propose(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
