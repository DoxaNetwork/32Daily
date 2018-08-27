import { combineReducers } from 'redux'


const history = (state = [], action) => {
    switch (action.type) {
        case 'INIT_HISTORY_API_SUCCESS':
            return [
            ...action.publishedWords
            ]
        case 'LOAD_ALL_HISTORY_API_SUCCESS':
            return [
            ...state,
            ...action.publishedWords
            ]
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
            return [
            ...state,
            action.newPost
            ]
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
            return { unsavedVotes: false, totalPending: 0, totalVotes: state.totalVotes - state.totalPending, pendingVotes: {} }
        case 'LOAD_SUBMISSIONS_API_SUCCESS':
            let totalVotes = 0;
            // use reduce here 
            for (let i = 0; i < action.submittedWords.length; i++) {
                totalVotes += action.submittedWords[i].backing;
            }
            return Object.assign({}, state, {
                totalVotes: totalVotes
            })
        default:
            return state
    }
}


export default combineReducers({
    history,
    historyLoaded,
    submissions,
    user,
    pendingVotes
})