import DoxaHubContract from '../build/contracts/DoxaHub.json'
import getWeb3 from './utils/getWeb3'
import {toAscii, dayOfWeek} from './utils/helpers'


const contract = require('truffle-contract')
const doxaHubContract = contract(DoxaHubContract)

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

/**
 * @summary Register a new user.
 */
async function registerUser(username){
    const doxaHub = await getContract(doxaHubContract);
    const account = await getCurrentAccount();
    const result = await doxaHub.register(username, {from: account});
    return result;
}

/**
 * @summary  Retrieve all registered users.
 */
async function getAllUsers(){
    const doxaHub = await getContract(doxaHubContract);

    const memberCount = await doxaHub.memberCount()
    const indexesToRetrieve = [...Array(memberCount.toNumber()).keys()]
    const functions = indexesToRetrieve.map(index => doxaHub.findMemberByIndex(index))
    let results = await Promise.all(functions)

    let users = []
    for (const [address, username, active, elected, balance, backing, availableToBackPosts] of results) {
        users.push({address, username, elected, balance, backing, availableToBackPosts})
    }
    return users
}

/**
 * @summary Retreive the user that is being used in MetaMask
 * 
 * The return is dictionary like {address, username, elected, balance, backing}
 */
async function getCurrentUser(){
    const users = await getAllUsers();  // Overall this can be done faster. TODO grab user by address directly
    const account = await getCurrentAccount();
    const currentUser =  users.find(user => user.address === account);
    return currentUser;
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
    const account = await getCurrentAccount();
    let event = doxaHub.PostBacked();
    return event;
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
    for (const [index, owner, link, backing] of results) {
        links.push({'word': toAscii(link), 'backing': backing.toNumber(), 'index': index.toNumber()})
    }
    return links
}

const numToPreLoad = 5;

async function getPreHistory() {
    const doxaHub = await getContract(doxaHubContract);
    const version = await doxaHub.currentVersion();
    const end = version.toNumber() - numToPreLoad;
    const start = 0;

    const words = await getHistory(start, end);
    return words;
}

async function preLoadHistory() {
    const doxaHub = await getContract(doxaHubContract);
    const version = await doxaHub.currentVersion();
    const end = version.toNumber();
    const start = Math.max(end - numToPreLoad, 0);

    const words = await getHistory(start, end, 'dayOfWeek')
    const allPreLoaded = start === 0;
    return [words, allPreLoaded];
}

async function getHistory(start, end, dateType) {
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dateOptions = {month: 'long', day: 'numeric' };
    const doxaHub = await getContract(doxaHubContract);
    const version = await doxaHub.currentVersion();
    
    let words = []
    let date = new Date();
    date.setDate(date.getDate() - version.toNumber() + start);

    for (let v = start; v < end; v++) {
        const blockLength = await doxaHub.getVersionLength(v);
        const indexesToRetrieve = [...Array(blockLength.toNumber()).keys()]
        const functions = indexesToRetrieve.map(i => doxaHub.getPublishedItem(v, i))

        let results = await Promise.all(functions)

        for (const [owner, content] of results) {

            if(dateType == 'dayOfWeek') {
                words.push({content:toAscii(content), date:dayOfWeek[date.getDay()]})
            } else {
                words.push({content:toAscii(content), date:date.toLocaleDateString('en-US', dateOptions)})
            }
        }
        date.setDate(date.getDate() + 1)
    }
    return words;
}

export {getCurrentUser,
        getContract,
        getCurrentAccount,
        getAllUsers,
        registerUser,
        getAllLinks,
        setUpPostListener,
        setUpUserPostBackedListener,
        setUpPostBackedListener,
        preLoadHistory,
        getPreHistory }