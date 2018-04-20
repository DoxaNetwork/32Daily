import BackableTokenContract from '../build/contracts/BackableToken.json'
import getWeb3 from './utils/getWeb3'
import toAscii from './utils/helpers'


const contract = require('truffle-contract')
const token = contract(BackableTokenContract)

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
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();
    const result = await tokenInstance.register(username, {from: account});
    return result;
}

/**
 * @summary  Retrieve all registered users.
 */
async function getAllUsers(){
    const tokenInstance = await getContract(token);

    const memberCount = await tokenInstance.memberCount()
    const indexesToRetrieve = [...Array(memberCount.toNumber()).keys()]
    const functions = indexesToRetrieve.map(index => tokenInstance.findMemberByIndex(index))
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
    const tokenInstance = await getContract(token);
    let event = tokenInstance.LinkPosted();
    return event;
}

async function setUpUserPostBackedListener() {
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();
    let event = tokenInstance.PostBacked({backer: account});
    return event;
}

async function setUpPostBackedListener() {
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();
    let event = tokenInstance.PostBacked();
    return event;
}

/**
 * @summary  Retrieve all linksthat have been submitted to the site
 */
async function getAllLinks(){
    const tokenInstance = await getContract(token);

    const count = await tokenInstance.getLinkCount()
    const indexesToRetrieve = [...Array(count.toNumber()).keys()]
    const functions = indexesToRetrieve.map(index => tokenInstance.getLinkByIndex(index))
    let results = await Promise.all(functions)

    let links = []
    for (const [index, owner, link, backing] of results) {
        links.push({index, owner, link, backing})
    }
    return links
}

async function getAllPastWords() {
    const tokenInstance = await getContract(token);
    

    let words = []
    let date = new Date();
    const version = await tokenInstance.currentVersion();
    let v;
    if (version.toNumber() >= 3) {
        date.setDate(date.getDate()- 3);
        v = version.toNumber() - 3;
    } else {
        v = 0;
        date.setDate(date.getDate()-version.toNumber());
    }

    for (; v < version.toNumber(); v++) {
        const blockLength = await tokenInstance.getVersionLength(v);
        const indexesToRetrieve = [...Array(blockLength.toNumber()).keys()]
        const functions = indexesToRetrieve.map(i => tokenInstance.getPublishedItem(v, i))

        let results = await Promise.all(functions)

        for (const [owner, content] of results) {
            var options = {month: 'long', day: 'numeric' };
            words.push({content:toAscii(content), date:date.toLocaleDateString('en-US', options)})
        }
        date.setDate(date.getDate()+1)
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
        getAllPastWords }