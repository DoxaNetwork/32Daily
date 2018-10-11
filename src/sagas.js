import { delay } from 'redux-saga'
import { put, takeEvery, all } from 'redux-saga/effects'

import contract from 'truffle-contract'
import DoxaHubContract from './contracts/DoxaHub.json'
import HigherFreq from './contracts/HigherFreq.json'
import Freq3 from './contracts/Freq3.json'

import { getContract, getCurrentAccount, preLoadHistory, getPreHistory, getAllLinks, getHigherFreqSubmissions } from './DappFunctions'
import { dayOfWeek, month } from './utils/helpers'
import { contentFromIPFS32, postToIPFS } from './utils/ipfs.js'

const doxaHubContract = contract(DoxaHubContract)
const HigherFreqContract = contract(HigherFreq)
const Freq3Contract = contract(Freq3)

const freq1Instance = getContract(doxaHubContract);
const freq2Instance = getContract(HigherFreqContract);
const freq3Instance = getContract(Freq3Contract);


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
    return {'poster': post.owner, word, 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
}

function* updateTokenBalance(action) {
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    if (currentAccount != undefined) {
        const tokenBalanceBN = yield doxaHub.balanceOf(currentAccount);
        const tokenBalance = tokenBalanceBN.toNumber();
        yield put({type: "TOKEN_BALANCE_UPDATE_SUCCESS", tokenBalance})
    }
}

function* updateAvailableToTransfer(action) {
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    if (currentAccount != undefined) {
        const availableVotesBN = yield doxaHub.availableToTransfer(currentAccount, '0x0');
        const availableVotes = availableVotesBN.toNumber();
        yield put({type: "AVAILABLE_TO_TRANSFER_UPDATE_SUCCESS", availableVotes})
    }
}

function* initAccount(action) {
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    yield put({type: "INIT_ACCOUNT_SUCCESS", currentAccount})
}

function* submitPost(action) {
    // need to init doxaHub
    const doxaHub = yield getContract(doxaHubContract);
    const ipfsPathShort = yield postToIPFS(action.text);

    const currentAccount = yield getCurrentAccount();
    const result = yield doxaHub.postLink(ipfsPathShort, { from: currentAccount})

    const filteredEvents = getEventsByType(result.logs, "LinkPosted")
    const newPost = yield mapPost(filteredEvents[0].args);

    // also need to update tokenBalance and availableVotes
    yield put({type: "CONTENT_POST_SUCCEEDED", freq: action.freq, newPost});
    yield delay(1200) // ANNOYING - WHY IS THIS NECESSARY
    yield put({type: "TOKEN_BALANCE_UPDATE"})
}




// ===========================================================================================================================================
// ============================== Functions shared between all freqs =========================================================================
// ===========================================================================================================================================

async function _getContract(action) {
    let contract;
    switch (action.freq) {
        case 'freq1':
            return freq1Instance;
        case 'freq2':
            return freq2Instance;
        case 'freq3':
            return freq3Instance;
        default:
            return freq1Instance;
    }
}

function* loadSubmissions(action) {
    let submittedWords;
    if(['freq2', 'freq3', 'freq4', 'freq5'].includes(action.freq)) {
        const contract = yield _getContract(action)
        submittedWords = yield getHigherFreqSubmissions(contract);
    }
    else if (action.freq == 'freq1') {
        submittedWords = yield getAllLinks();
    }
    submittedWords.sort((a,b) => {return b.backing - a.backing})
    yield put({type: "LOAD_SUBMISSIONS_API_SUCCESS", freq: action.freq, submittedWords: submittedWords})
}

function* loadPublishTime(action) {
    const contract = yield _getContract(action)
    const nextPublishTime = yield contract.nextPublishTime();

    yield put({type: "LOAD_PUBLISH_TIME_SUCCESS", nextPublishTime, freq: action.freq})
}

function* loadInitHistory(action) {
    const contract = yield _getContract(action)
    const [publishedWords, allPreLoaded] = yield preLoadHistory(contract);
    publishedWords.reverse();
    yield put({type: "INIT_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedWords, allPreLoaded: allPreLoaded})
}

function* loadFullHistory(action) {
    const contract = yield _getContract(action)
    const publishedWords = yield getPreHistory(contract);
    publishedWords.reverse();
    yield put({type: "LOAD_ALL_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedWords, allPreLoaded: true})
}

function* persistVote(action) {
    const contract = yield _getContract(action);
    const currentAccount = yield getCurrentAccount();
    const result = yield contract.backPost(action.index, { from: currentAccount })
    yield put({type: "PERSIST_VOTE_API_SUCCESS", freq: action.freq});  
}

export default function* rootSaga() {
    yield takeEvery('LOAD_LATEST_HISTORY', loadInitHistory)
    yield takeEvery('LOAD_ALL_HISTORY', loadFullHistory)

    yield takeEvery('LOAD_SUBMISSIONS', loadSubmissions)

    yield takeEvery('LOAD_BALANCE', updateTokenBalance)
    yield takeEvery('LOAD_AVAILABLE_BALANCE', updateAvailableToTransfer)
    yield takeEvery('LOAD_ACCOUNT', initAccount)

    yield takeEvery('SUBMIT_CONTENT', submitPost)
    yield takeEvery('SUBMIT_VOTE', persistVote)

    yield takeEvery('LOAD_PUBLISH_TIME', loadPublishTime)
}