import { delay } from 'redux-saga'
import { put, takeEvery, select } from 'redux-saga/effects'

import contract from 'truffle-contract'
import DoxaHubContract from './contracts/DoxaHub.json'
import HigherFreq from './contracts/HigherFreq.json'
import Freq3 from './contracts/Freq3.json'
import MemberRegistryContract from './contracts/MemberRegistry.json'

import { getContract, getCurrentAccount, preLoadHistory, getPreHistory, getAllLinks, getHigherFreqSubmissions } from './DappFunctions'
import { toAscii } from './utils/helpers'
import { contentFromIPFS32, postToIPFS, fileFromIPFS } from './utils/ipfs.js'

const doxaHubContract = contract(DoxaHubContract)
const HigherFreqContract = contract(HigherFreq)
const Freq3Contract = contract(Freq3)
const memberRegistryContract = contract(MemberRegistryContract)


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
    const currentAccount = yield getCurrentAccount();
    if (currentAccount !== undefined) {
        const freq1Instance = yield getContract(doxaHubContract);
        const tokenBalanceBN = yield freq1Instance.balanceOf(currentAccount);
        const tokenBalance = tokenBalanceBN.toNumber();
        yield put({type: "TOKEN_BALANCE_UPDATE_SUCCESS", tokenBalance})
    }
}

function* updateAvailableToTransfer(action) {
    const currentAccount = yield getCurrentAccount();
    if (currentAccount !== undefined) {
        const freq1Instance = yield getContract(doxaHubContract);
        const availableVotesBN = yield freq1Instance.availableToTransfer(currentAccount, '0x0');
        const availableVotes = availableVotesBN.toNumber();
        yield put({type: "AVAILABLE_TO_TRANSFER_UPDATE_SUCCESS", availableVotes})
    }
}

function* initAccount(action) {
    const currentAccount = yield getCurrentAccount();
    yield put({type: "INIT_ACCOUNT_SUCCESS", currentAccount})
}

function* submitPost(action) {
    // need to init doxaHub
    const ipfsPathShort = yield postToIPFS(action.text);

    const currentAccount = yield getCurrentAccount();
    const freq1Instance = yield getContract(doxaHubContract);
    const result = yield freq1Instance.postLink(ipfsPathShort, { from: currentAccount})

    const filteredEvents = getEventsByType(result.logs, "LinkPosted")
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

async function _getContract(action) {
    switch (action.freq) {
        // need to not load these multiple times
        case 'freq1':
            return await getContract(doxaHubContract);
        case 'freq2':
            return await getContract(HigherFreqContract);
        case 'freq3':
            return await getContract(Freq3Contract);
        default:
            return await getContract(doxaHubContract);
    }
}

function* loadSubmissions(action) {
    let submittedWords;
    if(['freq2', 'freq3'].includes(action.freq)) {
        const contract = yield _getContract(action)
        submittedWords = yield getHigherFreqSubmissions(contract);
    }
    else if (action.freq === 'freq1') {
        submittedWords = yield getAllLinks();
    }
    submittedWords.sort((a,b) => {return b.backing - a.backing})

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
    const contract = yield _getContract(action)
    const nextPublishTime = yield contract.nextPublishTime();

    yield put({type: "LOAD_PUBLISH_TIME_SUCCESS", nextPublishTime, freq: action.freq})
}

function* loadInitHistory(action) {
    const contract = yield _getContract(action)
    const [publishedWords, allPreLoaded] = yield preLoadHistory(contract);
    publishedWords.reverse();

    yield put({type: "INIT_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedWords, allPreLoaded: allPreLoaded})

    yield put({type: "LOAD_USERS_IF_NEEDED", words: publishedWords})
}

function* loadFullHistory(action) {
    const contract = yield _getContract(action)
    const publishedWords = yield getPreHistory(contract);
    publishedWords.reverse();
    yield put({type: "LOAD_ALL_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedWords, allPreLoaded: true})
    yield put({type: "LOAD_USERS_IF_NEEDED", words: publishedWords})
}

function* persistVote(action) {
    const contract = yield _getContract(action);
    const currentAccount = yield getCurrentAccount();
    yield contract.backPost(action.index, { from: currentAccount })
    yield put({type: "PERSIST_VOTE_API_SUCCESS", freq: action.freq});  

    yield newNotification()
}

function* loadUser(action) {
    const registry = yield getContract(memberRegistryContract)
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
    yield takeEvery('LOAD_LATEST_HISTORY', loadInitHistory)
    yield takeEvery('LOAD_ALL_HISTORY', loadFullHistory)

    yield takeEvery('LOAD_SUBMISSIONS', loadSubmissions)

    yield takeEvery('LOAD_BALANCE', updateTokenBalance)
    yield takeEvery('LOAD_AVAILABLE_BALANCE', updateAvailableToTransfer)
    yield takeEvery('LOAD_ACCOUNT', initAccount)

    yield takeEvery('SUBMIT_CONTENT', submitPost)
    yield takeEvery('SUBMIT_VOTE', persistVote)

    yield takeEvery('LOAD_PUBLISH_TIME', loadPublishTime)

    yield takeEvery('LOAD_USER', loadUser)
    yield takeEvery('LOAD_USER_IF_NEEDED', loadUserIfNeeded)
    yield takeEvery('LOAD_USERS_IF_NEEDED', loadUsersIfNeeded)
}