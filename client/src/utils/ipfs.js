import bs58 from 'bs58';
import IPFS from 'ipfs-api';

let ipfs;

async function getIPFSNode() {
  try {
    ipfs = new IPFS();
    await ipfs.id()
    console.log('connected to local ipfs node')
  } catch {
    ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    console.log('could not find local node, connecting to infura node')
  }
}
getIPFSNode();

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

async function contentFromIPFS32(ipfs32) {
    const ipfsHash = getIpfsHashFromBytes32(ipfs32);
    const fetched = await ipfs.files.cat(ipfsHash);
    return fetched.toString('utf8');
}

async function postToIPFS(text) {
    const response = await ipfs.files.add(new Buffer(text));
    const ipfsPath = response[0]['path'];
    const ipfsPathShort = getBytes32FromIpfsHash(ipfsPath)
    return ipfsPathShort;
}

export {
    contentFromIPFS32,
    postToIPFS,
};