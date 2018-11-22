import bs58 from 'bs58';
import IPFS from 'ipfs-api';

let ipfs;
let ipfsLoaded;

async function getIPFSNode() {
  if (ipfsLoaded) {
    return ipfs;
  }
  try {
    ipfs = new IPFS();
    await ipfs.id();
    console.log('connected to local ipfs node')
  } catch {
    ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    console.log('could not find local ipfs node, connecting to infura ipfs');
  }
  ipfsLoaded = true;
  return ipfs;
}

function getBytes32FromIpfsHash(ipfsListing) {
    return "0x" + bs58.decode(ipfsListing).slice(2).toString('hex');
}

function getIpfsHashFromBytes32(bytes32Hex) {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = "1220" + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex');
  const hashStr = bs58.encode(hashBytes)
  return hashStr
}

async function fileFromIPFS(ipfsHash) {
  const ipfs = await getIPFSNode();
  // const ipfsHash = getIpfsHashFromBytes32(ipfs32);
  const fetched = await ipfs.files.cat(ipfsHash);
  return fetched;
}

async function fileToIPFS(readerResult) {
  const ipfs = await getIPFSNode();
  const buffer = Buffer.from(readerResult)
  const response = await ipfs.add(buffer);
  const ipfsPath = response[0]['path'];
  ipfs.pin.add(ipfsPath);
  return ipfsPath;
}

async function contentFromIPFS32(ipfs32) {
    const ipfs = await getIPFSNode();
    const ipfsHash = getIpfsHashFromBytes32(ipfs32);
    const fetched = await ipfs.files.cat(ipfsHash);
    return fetched.toString('utf8');
}

async function postToIPFS(text) {
    const ipfs = await getIPFSNode();
    const response = await ipfs.files.add(Buffer.from(text));
    const ipfsPath = response[0]['path'];
    ipfs.pin.add(ipfsPath);
    const ipfsPathShort = getBytes32FromIpfsHash(ipfsPath)
    return ipfsPathShort;
}

export {
    contentFromIPFS32,
    postToIPFS,
    fileFromIPFS,
    fileToIPFS
};