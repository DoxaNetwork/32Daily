import { combineReducers } from 'redux'

const history = (state = [], action) => {
    switch (action.type) {
        case 'INIT_HISTORY_API_SUCCESS':
            return action.publishedWords
        case 'LOAD_ALL_HISTORY_API_SUCCESS':
            return [...state[action.freq], ...action.publishedWords]
        default:
            return state
    }
}

const historyLoaded = (state = false, action) => {
    switch (action.type) {
        case 'INIT_HISTORY_API_SUCCESS':
            return action.allPreLoaded
        case 'LOAD_ALL_HISTORY_API_SUCCESS':
            return action.allPreLoaded
        default:
            return state
    }
}

const submissions = (state = [], action) => {
    switch (action.type) {
        case 'LOAD_SUBMISSIONS_API_SUCCESS':
            return action.submittedWords
        case 'CONTENT_POST_SUCCEEDED':
            return [...state, action.newPost]
        default:
            return state
    }
}

const user = (state = {}, action) => {
    switch (action.type) {
        case 'TOKEN_BALANCE_UPDATE_SUCCESS':
            return Object.assign({}, state, {
                balance: action.tokenBalance
            })
        case 'AVAILABLE_TO_TRANSFER_UPDATE_SUCCESS':
            return Object.assign({}, state, {
                available: action.availableVotes
            })
        case 'INIT_ACCOUNT_SUCCESS':
            return Object.assign({}, state, {
                account: action.currentAccount
            })
        default:
            return state
    }
}

const pendingVotes = (state = {unsavedVotes:false, totalPending: 0, totalVotes: 0, pendingVotes:{}}, action) => {
    switch (action.type) {
        case 'PEND_VOTE':
            let pendingVotes = {...state.pendingVotes}
            pendingVotes[action.index] ? pendingVotes[action.index] += 1 : pendingVotes[action.index] = 1;
            return {
                unsavedVotes: true,
                totalPending: state.totalPending +=1,
                totalVotes: state.totalVotes +=1,
                pendingVotes
            }
        case 'CLEAR_VOTES':
            return { 
                unsavedVotes: false, 
                totalPending: 0, 
                totalVotes: state.totalVotes - state.totalPending, 
                pendingVotes: {} 
            }
        case 'LOAD_SUBMISSIONS_API_SUCCESS':
            const totalVotes = action.submittedWords.reduce((sum, word) => (sum + word.backing), 0)
            return Object.assign({}, state, {
                totalVotes: totalVotes
            })
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

const freqReducer = combineReducers({
    history,
    historyLoaded,
    submissions,
    pendingVotes,
    nextPublishTime
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
    freq4: createFilteredReducer(freqReducer, action => action.freq === 'freq4'),
    freq5: createFilteredReducer(freqReducer, action => action.freq === 'freq5'),
    user
})

export default rootReducer;
