import { combineReducers } from 'redux'

const history = (state = [], action) => {
    switch (action.type) {
        case 'INIT_HISTORY_API_SUCCESS':
            return action.publishedWords
        case 'LOAD_ALL_HISTORY_API_SUCCESS':
            return [...state, ...action.publishedWords]
        default:
            return state
    }
}

const historyLoadedAll = (state = false, action) => {
    switch (action.type) {
        case 'INIT_HISTORY_API_SUCCESS':
            return action.allPreLoaded
        case 'LOAD_ALL_HISTORY_API_SUCCESS':
            return action.allPreLoaded
        default:
            return state
    }
}

const historyLoadedSome = (state = false, action) => {
    switch (action.type) {
        case 'INIT_HISTORY_API_SUCCESS':
            return true
        case 'LOAD_ALL_HISTORY_API_SUCCESS':
            return true
        default:
            return state
    }
}

function setPendingVote(array, action) {
  return array.map((post) => {
    if (post.index !== action.index || post.chain !== action.chain) {
      return post
    }
    post.votes += 1;
    post.pendingVotes = true;
    return post
  })
}

function setConfirmedVote(array, action) {
  return array.map((post) => {
    if (post.index !== action.index || post.chain !== action.chain) {
      return post
    }
    post.pendingVotes = false;
    return post
  })
}

const submissions = (state = [], action) => {
    switch (action.type) {
        case 'LOAD_SUBMISSIONS_API_SUCCESS':
            return action.submittedWords
        case 'PENDING_POST_CONFIRMED':
            return [action.newPost, ...state]
        case 'PERSIST_VOTE_HASH':
            return setPendingVote(state, action)
        case 'PERSIST_VOTE_CONFIRMED':
            return setConfirmedVote(state, action)
        default:
            return state
    }
}

const pendingSubmissions = (state = [], action) => {
    switch (action.type) {
        case 'PENDING_POST':
            return [action.pendingPost, ...state]
        case 'PENDING_POST_CONFIRMED':
            return state.filter(post => post.hash !== action.hash)
        default:
            return state
    }
}

const submissionsLoaded = (state = false, action) => {
    switch (action.type) {
        case 'LOAD_SUBMISSIONS_API_SUCCESS':
            return true
        default:
            return state
    }
}

const account = (state = {}, action) => {
    switch (action.type) {
        case 'INIT_ACCOUNT_SUCCESS':
            return {...state, ...{account: action.currentAccount}}
        default:
            return state
    }
}

const users = (state = {}, action) => {
    switch (action.type) {
        case 'USERNAME_UPDATE_SUCCESS':
            return {...state, ...{[action.address]: {...state[action.address], ...{username: action.username}}}}
        case 'PROFILE_UPDATE_SUCCESS':
            return {...state, ...{[action.address]: {...state[action.address], ...{profile: action.profile}}}}
        case 'PICTURE_UPDATE_SUCCESS':
            return {...state, ...{[action.address]: {...state[action.address], ...{picture: action.picture}}}}
        case 'USER_BALANCE_UPDATE':
            return {...state, ...{[action.address]: {...state[action.address], ...{tokenBalance: action.tokenBalance}}}}
        default:
            return state
    }
}

const nextPublishTime = (state = 0, action) => {
    switch (action.type) {
        case 'LOAD_PUBLISH_TIME_SUCCESS':
            return action.nextPublishTime
        default:
            return state
    }
}

const notifications = (state = [], action) => {
    switch (action.type) {
        case 'NEW_NOTIFICATION':
            const { message, timeStamp } = action;
            return [{message, timeStamp}, ...state]
        case 'CLEAR_NOTIFICATION':
            return state.slice(1)
        default:
            return state
    }
}

const modals = (state = [], action) => {
    switch (action.type) {
        case 'NEW_MODAL':
            const { message, header, id } = action;
            return [...state, {message, header, id}]
        case 'CLEAR_MODAL':
            return state.slice(1)
        default:
            return state
    }
}

const redirect = (state = false, action) => {
    switch (action.type) {
        case 'REDIRECT':
            return true
        case 'CLEAR_REDIRECT':
            return false
        default:
            return state
    }
}

const freqReducer = combineReducers({
    history,
    historyLoadedSome,
    historyLoadedAll,
    pendingSubmissions,
    submissions,
    submissionsLoaded,
    nextPublishTime,
})

function createFilteredReducer(reducerFunction, reducerPredicate) {
    return (state, action) => {
        const isInitializationCall = state === undefined;
        const shouldRunWrappedReducer = reducerPredicate(action) || isInitializationCall;
        return shouldRunWrappedReducer ? reducerFunction(state, action) : state;
    }
}

const rootReducer = combineReducers({
    freq1: createFilteredReducer(freqReducer, action => action.freq === 'freq1'),
    freq2: createFilteredReducer(freqReducer, action => action.freq === 'freq2'),
    freq3: createFilteredReducer(freqReducer, action => action.freq === 'freq3'),
    account,
    users,
    notifications,
    modals,
    redirect
})

export default rootReducer;
