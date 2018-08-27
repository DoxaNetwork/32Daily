import contract from 'truffle-contract'
import DoxaHubContract from '../build/contracts/DoxaHub.json'

const doxaHubContract = contract(DoxaHubContract)

import { getContract, getCurrentAccount, preLoadHistory, getPreHistory, getAllLinks } from './DappFunctions'
import { ByteArrayToString, stringToChunkedArray, dayOfWeek, month } from './utils/helpers'

import { put, takeEvery, all } from 'redux-saga/effects'

import { delay } from 'redux-saga'

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

function* loadFullHistory(action) {
    const publishedWords = yield getPreHistory();
    publishedWords.reverse();
    yield put({type: "LOAD_ALL_HISTORY_API_SUCCESS", publishedWords: publishedWords, allPreLoaded: true})
}

function* loadInitHistory(action) {
    const [publishedWords, allPreLoaded] = yield preLoadHistory();
    publishedWords.reverse();
    yield put({type: "INIT_HISTORY_API_SUCCESS", publishedWords: publishedWords, allPreLoaded: allPreLoaded})
}

function* loadSubmissions(action) {
    const submittedWords = yield getAllLinks();
    submittedWords.sort((a, b) => {return b.backing - a.backing})
    yield put({type: "LOAD_SUBMISSIONS_API_SUCCESS", submittedWords: submittedWords})
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
    const availableVotesBN = yield doxaHub.availableToTransfer(currentAccount);
    const availableVotes = availableVotesBN.toNumber();
    yield put({type: "AVAILABLE_TO_TRANSFER_UPDATE_SUCCESS", availableVotes})
}

function* initAccount(action) {
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    yield put({type: "INIT_ACCOUNT_SUCCESS", currentAccount})
}

function* submitPost(action) {
    // need to iniit doxaHub
    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();
    const result = yield doxaHub.postLink(stringToChunkedArray(action.text), { from: currentAccount})
    console.log('post returned')

    const filteredEvents = getEventsByType(result.logs, "LinkPosted")
    const newPost = mapPost(filteredEvents[0].args);

    // also need to update tokenBalance and availableVotes
    yield put({type: "CONTENT_POST_SUCCEEDED", newPost});
    yield delay(1200) // ANNOYING - WHY IS THIS NECESSARY
    yield put({type: "TOKEN_BALANCE_UPDATE"})
}

function* persistVotes(action) {
    // should probably read pendingVotes from state instead of passing
    const indexes = Object.keys(action.pendingVotes);
    const votes = Object.values(action.pendingVotes);

    const doxaHub = yield getContract(doxaHubContract);
    const currentAccount = yield getCurrentAccount();

    const result = yield doxaHub.backPosts(indexes, votes, { from: currentAccount })

    yield put({type: "PERSIST_VOTES_SUCCESS"});

    // after this, need to update how many votes each post has, and re-sort

    
        // const submittedWords = this.state.submittedWords.map(word => {
        //     if(pendingVotes[word.index] !== undefined) {
        //         word.backing += pendingVotes[word.index];
        //     }
        //     return word;
        // } )

        // submittedWords.sort((a, b) => {return b.backing - a.backing})

        // this.setState({submittedWords})
}

export default function* rootSaga() {
    yield takeEvery('SUBMIT_CONTENT', submitPost),
    yield takeEvery('INIT_HISTORY', loadInitHistory)
    yield takeEvery('LOAD_ALL_HISTORY', loadFullHistory)
    yield takeEvery('LOAD_SUBMISSIONS', loadSubmissions)
    yield takeEvery('TOKEN_BALANCE_UPDATE', updateTokenBalance)
    yield takeEvery('AVAILABLE_TO_TRANSFER_UPDATE', updateAvailableToTransfer)
    yield takeEvery('INIT_ACCOUNT', initAccount)
    yield takeEvery('PERSIST_VOTES', persistVotes)
}