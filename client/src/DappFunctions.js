import DoxaHubContract from './contracts/DoxaHub.json'
import getWeb3 from './utils/getWeb3'
import { contentFromIPFS32 } from './utils/ipfs.js'

const contract = require('truffle-contract')
const doxaHubContract = contract(DoxaHubContract)


const simpleCache = {};  // This can be used for simple objects, like the current user's account address


async function getContract(contract) {
    let results = await getWeb3
    contract.setProvider(results.web3.currentProvider)

    // this find the address from the ./build/contracts/.json file
    return await contract.deployed();
}

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