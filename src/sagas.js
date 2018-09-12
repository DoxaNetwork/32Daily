import { delay } from 'redux-saga'
import { put, takeEvery, all } from 'redux-saga/effects'

import contract from 'truffle-contract'
import DoxaHubContract from '../build/contracts/DoxaHub.json'
import HigherFreq from '../build/contracts/HigherFreq.json'


import { getContract, getCurrentAccount, preLoadHistory, getPreHistory, getAllLinks, getAllFreq2Submissions } from './DappFunctions'
import { ByteArrayToString, stringToChunkedArray, dayOfWeek, month } from './utils/helpers'

const doxaHubContract = contract(DoxaHubContract)
const HigherFreqContract = contract(HigherFreq)



function getEventsByType(events, type) {
    let matchedEvents = []
    for (let i = 0; i < events.length; i++) {
        if (events[i].event === type) {
            matchedEvents.push(events[i])
        }
    }
    return matchedEvents;
}

function mapPost(post) {
    return {'poster': post.owner, 'word': ByteArrayToString(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
}

function* updateTokenBalance(action) {
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    const tokenBalanceBN = yield doxaHub.balanceOf(currentAccount);
    const tokenBalance = tokenBalanceBN.toNumber();
    yield put({type: "TOKEN_BALANCE_UPDATE_SUCCESS", tokenBalance})
}

function* updateAvailableToTransfer(action) {
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    const availableVotesBN = yield doxaHub.availableToTransfer(currentAccount, '0x0');
    const availableVotes = availableVotesBN.toNumber();
    yield put({type: "AVAILABLE_TO_TRANSFER_UPDATE_SUCCESS", availableVotes})
}

function* initAccount(action) {
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    yield put({type: "INIT_ACCOUNT_SUCCESS", currentAccount})
}

function* submitPost(action) {
    // need to init doxaHub
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    const result = yield doxaHub.postLink(stringToChunkedArray(action.text), { from: currentAccount})

    const filteredEvents = getEventsByType(result.logs, "LinkPosted")
    const newPost = mapPost(filteredEvents[0].args);

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
            contract = doxaHubContract;
            break;
        case 'freq2':
            contract = HigherFreqContract
            break;
        default:
            contract = doxaHubContract
    }
    return await getContract(contract)
}

function* loadSubmissions(action) {
    let submittedWords;
    if(action.freq == 'freq2') {
        submittedWords = yield getAllFreq2Submissions();
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

function* persistVotes(action) {
    const contract = yield _getContract(action)
    const indexes = Object.keys(action.pendingVotes);
    const currentAccount = yield getCurrentAccount();

    const result = yield contract.backPosts(indexes, { from: currentAccount })

    yield put({type: "PERSIST_VOTES_SUCCESS", freq: action.freq});
}


export default function* rootSaga() {
    yield takeEvery('LOAD_LATEST_HISTORY', loadInitHistory)
    yield takeEvery('LOAD_ALL_HISTORY', loadFullHistory)

    yield takeEvery('LOAD_SUBMISSIONS', loadSubmissions)

    yield takeEvery('LOAD_BALANCE', updateTokenBalance)
    yield takeEvery('LOAD_AVAILABLE_BALANCE', updateAvailableToTransfer)
    yield takeEvery('LOAD_ACCOUNT', initAccount)

    yield takeEvery('SUBMIT_CONTENT', submitPost),
    yield takeEvery('SUBMIT_VOTES', persistVotes)

    yield takeEvery('LOAD_PUBLISH_TIME', loadPublishTime)
}