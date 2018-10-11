import DoxaHubContract from '../build/contracts/DoxaHub.json'
import HigherFreq from '../build/contracts/HigherFreq.json'
import getWeb3 from './utils/getWeb3'
import {ByteArrayToString, dayOfWeek} from './utils/helpers'


const contract = require('truffle-contract')
const doxaHubContract = contract(DoxaHubContract)
const HigherFreqContract = contract(HigherFreq)
window.contract = contract;

const peep = `
    [ { "constant": false, "inputs": [ { "name": "_followee", "type": "address" } ], "name": "unFollow", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ipfsHash", "type": "string" } ], "name": "updateAccount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "isActive", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_isActive", "type": "bool" } ], "name": "setIsActive", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_followee", "type": "address" } ], "name": "follow", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_name", "type": "bytes16" } ], "name": "changeName", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "names", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ipfsHash", "type": "string" } ], "name": "reply", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "addresses", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_address", "type": "address" } ], "name": "setNewAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_addr", "type": "address" } ], "name": "accountExists", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "bStr", "type": "bytes16" } ], "name": "isValidName", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ipfsHash", "type": "string" } ], "name": "share", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ipfsHash", "type": "string" } ], "name": "saveBatch", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "cashout", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ipfsHash", "type": "string" } ], "name": "post", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_name", "type": "bytes16" }, { "name": "_ipfsHash", "type": "string" } ], "name": "createAccount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "newMinPercentage", "type": "uint256" } ], "name": "setMinSiteTipPercentage", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_author", "type": "address" }, { "name": "_messageID", "type": "string" }, { "name": "_ownerTip", "type": "uint256" }, { "name": "_ipfsHash", "type": "string" } ], "name": "tip", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "newAddress", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "interfaceInstances", "outputs": [ { "name": "interfaceAddress", "type": "address" }, { "name": "startBlock", "type": "uint96" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_address", "type": "address" } ], "name": "transferAccount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "lockMinSiteTipPercentage", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "interfaceInstanceCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minSiteTipPercentage", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "tipPercentageLocked", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [], "name": "PeepethEvent", "type": "event" } ]
`
window.peep = peep;
window.addr = '0xfa28ec7198028438514b49a3cf353bca5541ce1d';

const peepContract = contract(peep)

const simpleCache = {};  // This can be used for simple objects, like the current user's account address

async function getContract(contract) {
    let results = await getWeb3
    contract.setProvider(results.web3.currentProvider)

    // option 1: will find the address from the ./build/contracts/.json file
    return await contract.deployed();
    // return contract.deployed() 

    // option 2: will always look for the same contract, currently the one that Travis
    //           deployed to the Ropsten test network
    // return contract.at('0xe809031eebd710af891a5c592c0d9ffc3f82411a')
}

// window.peep = getContract(peepContract);

// Get the address of the user in MetaMask.  Uses the simple cache
async function getCurrentAccount(){
    if ('currentAccount' in simpleCache){
        const account = simpleCache['currentAccount'];
        console.debug('Get "currentAcount" from simpleCache: ' + account);
        return account;
    }
        
    let results = await getWeb3;
    const account = results.web3.eth.accounts[0];
    simpleCache['currentAccount'] = account;
    return account;
}

// TODO memoize this so only one event listener is created
async function setUpPostListener() {
    const doxaHub = await getContract(doxaHubContract);
    let event = doxaHub.LinkPosted();
    return event;
}

async function setUpUserPostBackedListener() {
    const doxaHub = await getContract(doxaHubContract);
    const account = await getCurrentAccount();
    let event = doxaHub.PostBacked({backer: account});
    return event;
}

async function setUpPostBackedListener() {
    const doxaHub = await getContract(doxaHubContract);
    let event = doxaHub.PostBacked();
    return event;
}


async function getHigherFreqSubmissions(_contract) {
    const [lower, upper] = await _contract.range()
    const indexesToRetrieve = Array.from(new Array(upper.toNumber() - lower.toNumber()), (x,i) => i + lower.toNumber())
    const functions = indexesToRetrieve.map(index => _contract.getItem(index))
    let results = await Promise.all(functions)

    let words = []
    let i = 0;
    for (const [poster, ipfsHash32, votes] of results) {
        const word = await contentFromIPFS32(ipfsHash32);
        words.push({'poster': poster, word, backing: votes.toNumber(), 'index':i })
        i += 1;
    }
    return words;
}
/**
 * @summary  Retrieve all links that have been submitted to the site
 */
function getIpfsHashFromBytes32(bytes32Hex) {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = "1220" + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex');
  const hashStr = bs58.encode(hashBytes)
  return hashStr
}

import bs58 from 'bs58'

async function getAllLinks(){
    const doxaHub = await getContract(doxaHubContract);

    const count = await doxaHub.getLinkCount()
    const indexesToRetrieve = [...Array(count.toNumber()).keys()]
    const functions = indexesToRetrieve.map(index => doxaHub.getLinkByIndex(index))
    let results = await Promise.all(functions)

    let links = []
    for (const [index, poster, ipfsHash32, backing] of results) {
        const word = await contentFromIPFS32(ipfsHash32);
        links.push({poster, word, 'backing': backing.toNumber(), 'index': index.toNumber()})
    }
    return links
}

const numToPreLoad = 6;

async function getPreHistory(_contract) {
    const version = await _contract.publishedIndex();
    const end = version.toNumber() - numToPreLoad;
    const start = 0;

    const words = await getHistory(_contract, start, end);
    return words;
}

async function preLoadHistory(_contract) {
    const version = await _contract.publishedIndex();
    const end = version.toNumber();
    const start = Math.max(end - numToPreLoad, 0);

    const words = await getHistory(_contract, start, end, 'dayOfWeek')
    const allPreLoaded = start === 0;
    return [words, allPreLoaded];
}

async function contentFromIPFS32(ipfs32) {
    const ipfsHash = getIpfsHashFromBytes32(ipfs32);
    const fetched = await fetch(`http://localhost:5001/get/?ipfsPath=${ipfsHash}`);
    const response = await fetched.json();
    return response.data;
}

async function getHistory(_contract, start, end, dateType) {
    let words = []
    const indexesToRetrieve = Array.from(new Array(end - start), (x,i) => i + start)
    const functions = indexesToRetrieve.map(i => _contract.getPublishedItem(i))
    let results = await Promise.all(functions)
    for (const [poster, ipfsHash32, timeStamp] of results) {
        const date = new Date(timeStamp * 1000);
        const word = await contentFromIPFS32(ipfsHash32);
        words.push({content:word, poster, date:date})
    }
    return words;
}

export {getContract,
        getCurrentAccount,
        getAllLinks,
        setUpPostListener,
        setUpUserPostBackedListener,
        setUpPostBackedListener,
        preLoadHistory,
        getPreHistory,
        getHigherFreqSubmissions }