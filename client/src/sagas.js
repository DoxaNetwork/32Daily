import { delay } from 'redux-saga'
import { put, takeEvery, select } from 'redux-saga/effects'
import contract from 'truffle-contract'

import { toAscii } from './utils/helpers'
import { contentFromIPFS32, postToIPFS, fileFromIPFS } from './utils/ipfs.js'
import getWeb3 from './utils/getWeb3'

import DoxaHub from './contracts/DoxaHub.json'
import HigherFreq from './contracts/HigherFreq.json'
import Freq3 from './contracts/Freq3.json'
import DoxaToken from './contracts/DoxaToken.json'
import MemberRegistry from './contracts/MemberRegistry.json'


const freqToContractJSON = {
    'freq1': DoxaHub,
    'freq2': HigherFreq,
    'freq3': Freq3
}

const contractsLoaded = {}

async function getContract(contractJSON, address) {
    const contractName = contractJSON.contractName + "-" + address;
    if (!contractsLoaded[contractName]) {
        const {web3} = await getWeb3
        const contractABI = contract(contractJSON)
        contractABI.setProvider(web3.currentProvider)
        if (address) {
            contractsLoaded[contractName] = await contractABI.at(address);
        } else {
            contractsLoaded[contractName] = await contractABI.deployed();
        }
    }
    return contractsLoaded[contractName];
}

async function getCurrentAccount(){
    let {web3} = await getWeb3;
    const account = web3.eth.accounts[0];
    return account;
}

function getEventsByType(events, type) {
    let matchedEvents = []
    for (let i = 0; i < events.length; i++) {
        if (events[i].event === type) {
            matchedEvents.push(events[i])
        }
    }
    return matchedEvents;
}

function* mapPost(post) {
    const word = yield contentFromIPFS32(post.ipfsHash);
    return {'poster': post.owner, word, votes: 0, chain: 0, index: 0}
}

function* initAccount(action) {
    const currentAccount = yield getCurrentAccount();
    yield put({type: "INIT_ACCOUNT_SUCCESS", currentAccount})
}

function* submitPost(action) {
    const getItems = state => state.account.account;
    const currentAccount = yield select(getItems);
    const contract = yield getContract(freqToContractJSON[action.freq])
    // const freq1Instance = yield getContract(DoxaHub);

    const ipfsPathShort = yield postToIPFS(action.text);
    const result = yield contract.newPost(ipfsPathShort, { from: currentAccount})

    const filteredEvents = getEventsByType(result.logs, "NewPost")
    const newPost = yield mapPost(filteredEvents[0].args);

    // also need to update tokenBalance and availableVotes
    yield put({type: "CONTENT_POST_SUCCEEDED", freq: action.freq, newPost});
    yield delay(1200) // ANNOYING - WHY IS THIS NECESSARY
    yield put({type: "TOKEN_BALANCE_UPDATE"})

    yield newNotification()

}

function* newNotification() {
    yield put({type: "NEW_NOTIFICATION", message: "submitted to blockchain", timeStamp: new Date().getTime()})
    yield delay(10000)
    yield put({type: "CLEAR_NOTIFICATION"})
}




// ===========================================================================================================================================
// ============================== Functions shared between all freqs =========================================================================
// ===========================================================================================================================================

async function getSubmissions(_contract) {
    const [lower, upper] = await _contract.range()
    const indexesToRetrieve = Array.from(new Array(upper.toNumber() - lower.toNumber()), (x,i) => i + lower.toNumber())
    const functions = indexesToRetrieve.map(index => _contract.getSubmittedItem(index, 0))
    let results = await Promise.all(functions)

    let posts = []
    for (const [index, poster, ipfsHash32, votes, publishedTime] of results) {
        const content = await contentFromIPFS32(ipfsHash32);
        posts.push({chain: 0, poster, content, 'votes': votes.toNumber(), 'index': index.toNumber()})
    }
    return posts
}

async function getSideChainSubmissions(_contract) {
    const [lower, upper] = await _contract.sideRange()
    console.log(lower.toNumber(), upper.toNumber());
    const indexesToRetrieve = Array.from(new Array(upper.toNumber() - lower.toNumber()), (x,i) => i + lower.toNumber())
    const functions = indexesToRetrieve.map(index => _contract.getSubmittedItem(index, 1))
    let results = await Promise.all(functions)

    let posts = []
    for (const [index, poster, ipfsHash32, votes, publishedTime] of results) {
        const content = await contentFromIPFS32(ipfsHash32);
        posts.push({chain: 1, side:true, poster, content, 'votes': votes.toNumber(), 'index': index.toNumber()})
    }
    return posts
}

function* loadSubmissions(action) {
    const contract = yield getContract(freqToContractJSON[action.freq])
    let submittedWords = yield getSubmissions(contract);

    console.log(submittedWords)
    let extraWords = []
    if (['freq2', 'freq3'].includes(action.freq)) {
        extraWords = yield getSideChainSubmissions(contract)
    }

    console.log(extraWords)
    submittedWords = [...submittedWords, ...extraWords];
    console.log(submittedWords)
    submittedWords.sort((a,b) => {return b.votes - a.votes})

    yield put({type: "LOAD_SUBMISSIONS_API_SUCCESS", freq: action.freq, submittedWords: submittedWords})

    yield put({type: "LOAD_USERS_IF_NEEDED", words: submittedWords})
}

function* loadUsersIfNeeded(action) {
    const accountsToLoad = {}

    action.words.map(word => {
        accountsToLoad[word.poster] = 1
    })

    for (const address in accountsToLoad) {
        yield put({type: "LOAD_USER_IF_NEEDED", address: address})
    } 
}

function* loadPublishTime(action) {
    const contract = yield getContract(freqToContractJSON[action.freq])
    const nextPublishTime = yield contract.nextPublishTime();

    yield put({type: "LOAD_PUBLISH_TIME_SUCCESS", nextPublishTime, freq: action.freq})
}

async function loadHistory(_contract, start, end) {
    let history = []
    const indexesToRetrieve = Array.from(new Array(end - start), (x,i) => i + start)
    const functions = indexesToRetrieve.map(i => _contract.getPublishedItem(i))
    let results = await Promise.all(functions)
    for (const [index, chainIndex, poster, ipfsHash32, votes, timeStamp] of results) {
        const date = new Date(timeStamp * 1000);
        const content = await contentFromIPFS32(ipfsHash32);
        history.push({content, poster, date, votes:votes.toNumber()})
    }
    return history;
}

const numToPreLoad = 6;

function* loadHistoryFirstPage(action) {
    const contract = yield getContract(freqToContractJSON[action.freq])
    const length = yield contract.publishedLength();
    const end = length.toNumber();
    const start = Math.max(end - numToPreLoad, 0);
    const allPreLoaded = start === 0;

    const publishedHistory = yield loadHistory(contract, start, end)
    publishedHistory.reverse();

    yield put({type: "INIT_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedHistory, allPreLoaded: allPreLoaded})

    yield put({type: "LOAD_USERS_IF_NEEDED", words: publishedHistory})
}

function* loadHistoryRemainingPages(action) {
    const contract = yield getContract(freqToContractJSON[action.freq])
    const length = yield contract.publishedLength();
    const end = length.toNumber() - numToPreLoad;
    const start = 0;

    const publishedHistory = yield loadHistory(contract, start, end);
    publishedHistory.reverse();
    yield put({type: "LOAD_ALL_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedHistory, allPreLoaded: true})
    yield put({type: "LOAD_USERS_IF_NEEDED", words: publishedHistory})
}

function* persistVote(action) {
    const contract = yield getContract(freqToContractJSON[action.freq])
    const getItems = state => state.account.account;
    const currentAccount = yield select(getItems);

    yield contract.backPost(action.index, action.chain, { from: currentAccount })
    yield put({type: "PERSIST_VOTE_API_SUCCESS", freq: action.freq});  

    yield newNotification()
}

function* loadUser(action) {
    const registry = yield getContract(MemberRegistry)
    let [owner, name, profileIPFS, exiled] = yield registry.get(action.address);
    let profile, imageUrl;
    name = toAscii(name)
    yield put({type: "USERNAME_UPDATE_SUCCESS", address: action.address, username:name})

    if (name !== '') {
        profile = yield contentFromIPFS32(profileIPFS);
        profile = JSON.parse(profile)
        yield put({type: "PROFILE_UPDATE_SUCCESS", address: action.address, profile:profile['profile']})

        const pictureHash = profile['image'];

        if (pictureHash !== null) {
            imageUrl = yield urlFromHash(pictureHash);
            yield put({type: "PICTURE_UPDATE_SUCCESS", address: action.address, picture:imageUrl})
        }        
    }
    yield loadUserBalance(action)
}

async function getTokenBalance(ownerAddress, tokenAddress) {
    const tokenInstance = await getContract(DoxaToken, tokenAddress);
    const tokenBalanceBN = await tokenInstance.balanceOf(ownerAddress);
    return tokenBalanceBN.toNumber();
}

function* loadUserBalance(action) {
    const token1Balance = yield getTokenBalance(action.address, '0x81a06c0374039d8f6c6f8df1eda95f6615fcef9a')
    const token2Balance = yield getTokenBalance(action.address, '0x071a9d36cf55929cb258449a4ea5dceee0338901')
    const token3Balance = yield getTokenBalance(action.address, '0x6844930e0e26d842dbc8ef0efc905dcae59883a2')

    yield put({type: "USER_BALANCE_UPDATE", address: action.address, token1Balance, token2Balance, token3Balance})
}

function* registerUser(action) {
    const registry = yield getContract(MemberRegistry);
    const getItems = state => state.user.currentAccount;
    const currentAccount = yield select(getItems);

    const {username, profile, imageIPFS} = action;
    const ipfsblob = {profile, image: imageIPFS}
    const ipfsPathShort = yield postToIPFS(JSON.stringify(ipfsblob));

    yield registry.create(username, ipfsPathShort, { from: currentAccount})
    yield newNotification()
}

function* updateUser(action) {
    const registry = yield getContract(MemberRegistry);
    const getItems = state => state.user.currentAccount;
    const currentAccount = yield select(getItems);

    const {profile, imageIPFS} = action;
    const ipfsblob = {profile, image: imageIPFS}
    const ipfsPathShort = yield postToIPFS(JSON.stringify(ipfsblob));
    yield registry.setProfile(ipfsPathShort, { from: currentAccount})
    yield newNotification()
}

function* loadUserIfNeeded(action) {
    const getItems = state => state.users;
    const state = yield select(getItems);

    const userLoaded = Boolean(state[action.address]);
    if (!userLoaded) {
        yield put({type: "LOAD_USER", address: action.address})
    }
}

async function urlFromHash(hash) {
    const picture = await fileFromIPFS(hash);
    const blob = new Blob( [ picture ], { type: "image/jpeg" } );
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL( blob );
    return imageUrl;
}

export default function* rootSaga() {
    yield takeEvery('LOAD_LATEST_HISTORY', loadHistoryFirstPage)
    yield takeEvery('LOAD_ALL_HISTORY', loadHistoryRemainingPages)

    yield takeEvery('LOAD_SUBMISSIONS', loadSubmissions)

    yield takeEvery('LOAD_ACCOUNT', initAccount)

    yield takeEvery('SUBMIT_CONTENT', submitPost)
    yield takeEvery('SUBMIT_VOTE', persistVote)

    yield takeEvery('LOAD_PUBLISH_TIME', loadPublishTime)

    yield takeEvery('LOAD_USER', loadUser)
    yield takeEvery('LOAD_USER_IF_NEEDED', loadUserIfNeeded)
    yield takeEvery('LOAD_USERS_IF_NEEDED', loadUsersIfNeeded)

    yield takeEvery('REGISTER_USER', registerUser)
    yield takeEvery('UPDATE_USER', updateUser)
}