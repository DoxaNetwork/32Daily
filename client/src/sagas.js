import { delay } from 'redux-saga'
import { put, takeEvery, select, fork } from 'redux-saga/effects'
import contract from 'truffle-contract'

import { toAscii } from './utils/helpers'
import { contentFromIPFS32, postToIPFS, fileFromIPFS } from './utils/ipfs.js'
import getWeb3 from './utils/getWeb3'

import DoxaHub from './contracts/DoxaHub.json'
import DoxaToken from './contracts/DoxaToken.json'
import MemberRegistry from './contracts/MemberRegistry.json'
import Factories from './factories/freqs.json'


const contractsLoaded = {}

async function getContract(contractJSON, address) {
    let contractName;
    contractName = contractJSON.contractName + "-" + address;
    if (!contractsLoaded[contractName]) {
        const {web3, networkId, web3Browser} = await getWeb3
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
    let {web3, networkId, web3Browser} = await getWeb3;
    if (web3Browser && networkId == 3) {
        try {
            await window.ethereum.enable()
        } catch (e) {}
        const account = web3.eth.accounts[0];
        return account;
    }
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
    const content = yield contentFromIPFS32(post.ipfsHash);
    return {'poster': post.owner, content, votes: 0, chain: 0, index: post.index.toNumber(), approvedChains:[]}
}

function getBalance(address) {
    return new Promise((resolve,reject) => {
        window.web3.eth.getBalance(address, (error, result) => {
            if(error) reject(error);
            resolve(result.toNumber())
        });
    });
}

function* initAccount(action) {
    const currentAccount = yield getCurrentAccount();
    if (currentAccount) {
        const balance = yield getBalance(currentAccount);
        if (balance < 0.5*10**18) {
            yield fork(getFunds, currentAccount)
        }   
    }
    yield put({type: "INIT_ACCOUNT_SUCCESS", currentAccount})
}

function* getFunds(address) {
    const result = yield fetch("https://upbloc.io/api/faucet/", {
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify({address})
    })
    const data = yield result.json()
    if (data.data && data.data['success']) {
        yield fork(newNotification, "To get you started, we just sent you 1 ether")
    }
}

function* getMetaMaskWarning() {
    // 1 - main
    // 3 - ropsten
    // 42 - kovan
    // 4 - rinkeby
    const {web3, networkId, web3Browser} = yield getWeb3
    if (!web3Browser) {
        yield put({type: "NEW_MODAL", id: "WEB3"})
    } else if (networkId !== 3) {
        yield put({type: "NEW_MODAL", id: "ROPSTEN"})
    }
}

function* submitPost(action) {
    const getItems = state => state.account.account;
    const currentAccount = yield select(getItems);
    if (!currentAccount) {
        // note - metamask may simply be locked
        yield fork(getMetaMaskWarning);
        return;
    }
    const contract = yield getContract(DoxaHub, Factories[action.freq]['hub'])

    yield fork(newNotification, 'saving to ipfs...')
    const ipfsPathShort = yield postToIPFS(action.text);
    yield fork(newNotification)
    const result = yield contract.newPost(ipfsPathShort, { from: currentAccount})

    const filteredEvents = getEventsByType(result.logs, "NewPost")
    const newPost = yield mapPost(filteredEvents[0].args);

    // also need to update tokenBalance and availableVotes
    yield put({type: "CONTENT_POST_SUCCEEDED", freq: action.freq, newPost});
    yield delay(1200) // ANNOYING - WHY IS THIS NECESSARY
    yield put({type: "TOKEN_BALANCE_UPDATE"})


}

function* newNotification(_message) {
    const message = _message || 'submitted to blockchain';
    yield put({type: "NEW_NOTIFICATION", message, timeStamp: new Date().getTime()})
    yield delay(10000)
    yield put({type: "CLEAR_NOTIFICATION"})
}

async function getSubmissions(_contract, chain) {
    const [lower, upper] = await _contract.range(chain)
    const indexesToRetrieve = Array.from(new Array(upper.toNumber() - lower.toNumber()), (x,i) => i + lower.toNumber())
    const functions = indexesToRetrieve.map(index => _contract.getSubmittedItem(index, chain))
    let results = await Promise.all(functions)

    let posts = []
    for (const [index, poster, ipfsHash32, votes, publishedTime, approvedChains] of results) {
        const content = await contentFromIPFS32(ipfsHash32);
        const date = new Date(publishedTime * 1000);
        const filteredChains = approvedChains.filter(c => c !== '0x0000000000000000000000000000000000000000')
        posts.push({
            chain,
            poster, 
            content, 
            date,
            votes: votes.toNumber(), 
            index: index.toNumber(), 
            approvedChains: filteredChains
        })
    }
    return posts
}

function* loadSubmissions(action) {
    const contract = yield getContract(DoxaHub, Factories[action.freq]['hub'])
    let submittedWords = yield getSubmissions(contract, 0);

    let extraWords = []
    if (['freq2', 'freq3'].includes(action.freq)) {
        extraWords = yield getSubmissions(contract, 1)
    }

    submittedWords = [...submittedWords, ...extraWords];
    submittedWords.sort((a,b) => {return b.date - a.date})

    yield put({type: "LOAD_SUBMISSIONS_API_SUCCESS", freq: action.freq, submittedWords: submittedWords})

    yield put({type: "LOAD_USERS_IF_NEEDED", words: submittedWords})
}

function* loadUsersIfNeeded(action) {
    const accountsToLoad = {}

    action.words.map(word => {
        accountsToLoad[word.poster] = 1;
        word.approvedChains.map(chain => {
            accountsToLoad[chain] = 1;
        })
    })

    for (const address in accountsToLoad) {
        yield put({type: "LOAD_USER_IF_NEEDED", address: address})
    } 
}

function* loadPublishTime(action) {
    const contract = yield getContract(DoxaHub, Factories[action.freq]['hub'])
    const nextPublishTime = yield contract.nextPublishTime();

    yield put({type: "LOAD_PUBLISH_TIME_SUCCESS", nextPublishTime, freq: action.freq})
}

async function loadHistory(_contract, start, end) {
    let history = []
    const indexesToRetrieve = Array.from(new Array(end - start), (x,i) => i + start)
    const functions = indexesToRetrieve.map(i => _contract.getPublishedItem(i))
    let results = await Promise.all(functions)
    for (const [index, poster, ipfsHash32, votes, timeStamp] of results) {
        const date = new Date(timeStamp * 1000);
        const content = await contentFromIPFS32(ipfsHash32);
        history.push({index, content, poster, date, votes:votes.toNumber(), approvedChains:[]})
    }
    return history;
}

const numToPreLoad = 6;

function* loadHistoryFirstPage(action) {
    const contract = yield getContract(DoxaHub, Factories[action.freq]['hub'])
    const length = yield contract.length();
    const end = length.toNumber();
    const start = Math.max(end - numToPreLoad, 0);
    const allPreLoaded = start === 0;

    const publishedHistory = yield loadHistory(contract, start, end)
    publishedHistory.reverse();

    yield put({type: "INIT_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedHistory, allPreLoaded: allPreLoaded})

    yield put({type: "LOAD_USERS_IF_NEEDED", words: publishedHistory})
}

function* loadHistoryRemainingPages(action) {
    const contract = yield getContract(DoxaHub, Factories[action.freq]['hub'])
    const length = yield contract.length();
    const end = length.toNumber() - numToPreLoad;
    const start = 0;

    const publishedHistory = yield loadHistory(contract, start, end);
    publishedHistory.reverse();
    yield put({type: "LOAD_ALL_HISTORY_API_SUCCESS", freq: action.freq, publishedWords: publishedHistory, allPreLoaded: true})
    yield put({type: "LOAD_USERS_IF_NEEDED", words: publishedHistory})
}

function* persistVote(action) {
    const getItems = state => state.account.account;
    const currentAccount = yield select(getItems);
    if (!currentAccount) {
        yield fork(getMetaMaskWarning);
        return;
    }
    const contract = yield getContract(DoxaHub, Factories[action.freq]['hub'])

    yield fork(newNotification)
    yield contract.backPost(action.index, action.chain, { from: currentAccount })
    yield put({type: "PERSIST_VOTE_API_SUCCESS", freq: action.freq});  

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

function* loadUserBalance(action) {
    const tokenInstance = yield getContract(DoxaToken);
    const tokenBalanceBN = yield tokenInstance.balanceOf(action.address);
    const tokenBalance = tokenBalanceBN.toNumber() / 10**18;

    yield put({type: "USER_BALANCE_UPDATE", address: action.address, tokenBalance})
}

function* registerUser(action) {
    const getItems = state => state.account.account;
    const currentAccount = yield select(getItems);
    if (!currentAccount) {
        yield fork(getMetaMaskWarning);
        return;
    }
    const registry = yield getContract(MemberRegistry);

    const {username, profile, imageIPFS} = action;
    const ipfsblob = {profile, image: imageIPFS}
    yield fork(newNotification, 'saving to ipfs...')
    const ipfsPathShort = yield postToIPFS(JSON.stringify(ipfsblob));
    yield fork(newNotification)
    yield registry.create(username, ipfsPathShort, { from: currentAccount})
}

function* updateUser(action) {
    const getItems = state => state.account.account;
    const currentAccount = yield select(getItems);
    if (!currentAccount) {
        yield fork(getMetaMaskWarning);
        return;
    }
    const registry = yield getContract(MemberRegistry);

    const {profile, imageIPFS} = action;
    const ipfsblob = {profile, image: imageIPFS}
    yield fork(newNotification, 'saving to ipfs...')
    const ipfsPathShort = yield postToIPFS(JSON.stringify(ipfsblob));
    yield fork(newNotification)
    yield registry.setProfile(ipfsPathShort, { from: currentAccount})
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