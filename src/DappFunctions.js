import DoxaHubContract from '../build/contracts/DoxaHub.json'
import HigherFreq from '../build/contracts/HigherFreq.json'
import getWeb3 from './utils/getWeb3'
import {ByteArrayToString, dayOfWeek} from './utils/helpers'


const contract = require('truffle-contract')
const doxaHubContract = contract(DoxaHubContract)
const HigherFreqContract = contract(HigherFreq)

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


async function getAllFreq2Submissions() {

    const freq = await getContract(HigherFreqContract);

    const [lower, upper] = await freq.range()
    console.log(lower.toNumber(), upper.toNumber())
    const indexesToRetrieve = Array.from(new Array(upper.toNumber() - lower.toNumber()), (x,i) => i + lower.toNumber())
    console.log(indexesToRetrieve)
    const functions = indexesToRetrieve.map(index => freq.getItem(index))
    let results = await Promise.all(functions)

    let words = []
    let i = 0;
    for (const [poster, content, votes] of results) {
        words.push({'poster': poster, 'word': ByteArrayToString(content), backing: votes.toNumber(), 'index':i })
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
    for (const [index, poster, link, backing] of results) {
        links.push({'poster': poster, 'word': ByteArrayToString(link), 'backing': backing.toNumber(), 'index': index.toNumber()})
    }
    return links
}

const numToPreLoad = 6;

async function getPreHistory(freq) {
    let _contract;
    if(freq == 'freq1') {
        _contract = await getContract(doxaHubContract);
    } else if (freq == 'freq2') {
        _contract = await getContract(HigherFreqContract);
    }

    // const doxaHub = await getContract(doxaHubContract);
    const version = await _contract.publishedIndex();
    const end = version.toNumber() - numToPreLoad;
    const start = 0;

    const words = await getHistory(_contract, start, end);
    return words;
}

async function preLoadHistory(freq) {
    let _contract;
    if(freq == 'freq1') {
        _contract = await getContract(doxaHubContract);
    } else if (freq == 'freq2') {
        _contract = await getContract(HigherFreqContract);
    }
    // const doxaHub = await getContract(doxaHubContract);
    const version = await _contract.publishedIndex();
    console.log('a')
    const end = version.toNumber();
    const start = Math.max(end - numToPreLoad, 0);

    const words = await getHistory(_contract, start, end, 'dayOfWeek')
    const allPreLoaded = start === 0;
    return [words, allPreLoaded];
}

async function getHistory(_contract, start, end, dateType) {
    const dateOptions = {month: 'long', day: 'numeric'};
    // const doxaHub = await getContract(doxaHubContract);
    
    let words = []
    const indexesToRetrieve = Array.from(new Array(end - start), (x,i) => i + start)
    const functions = indexesToRetrieve.map(i => _contract.getPublishedItem(i))
    let results = await Promise.all(functions)
    for (const [poster, content, timeStamp] of results) {
        const date = new Date(timeStamp * 1000);
        if(dateType === 'dayOfWeek') {
            words.push({content:ByteArrayToString(content), poster, date:dayOfWeek(date)})
        } else {
            words.push({content:ByteArrayToString(content), poster, date:date.toLocaleDateString('en-US', dateOptions)})
        }
    }
    return words;
}

//     for (let v = start; v < end; v++) {
//         // const [blockLength, timeStamp] = await doxaHub.getVersion(v);
//         const date = new Date(timeStamp * 1000)
// 
//         const indexesToRetrieve = [...Array(blockLength.toNumber()).keys()]
// 
// 
//     }

export {getContract,
        getCurrentAccount,
        getAllLinks,
        setUpPostListener,
        setUpUserPostBackedListener,
        setUpPostBackedListener,
        preLoadHistory,
        getPreHistory,
        getAllFreq2Submissions }