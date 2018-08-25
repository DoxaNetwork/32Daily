// actions

// should I inject owner information here?
export const submitContent = (text, owner) => ({
    type: 'SUBMIT_CONTENT',
    text,
    owner
})

export const submitVote = (index, quantity) => ({
    type: 'SUBMIT_VOTE',
    index,
    quantity
})

export const initHistory = () => ({
    type: 'INIT_HISTORY'
})

export const allHistory = () => ({
    type: 'LOAD_ALL_HISTORY'
})

export const loadSubmittedWords = () => ({
    type: 'LOAD_SUBMISSIONS'
})

export const initTokenBalance = () => ({
    type: 'TOKEN_BALANCE_UPDATE'
})

export const updateAvailableVotes = () => ({
    type: 'AVAILABLE_TO_TRANSFER_UPDATE'
})

export const initAccount = () => ({
    type: 'INIT_ACCOUNT'
})

// reducers

const words = (state = ['word'], action) => {
    console.log('word reducer running')
    switch (action.type) {
        case 'SUBMIT_CONTENT':
            return [
                ...state,
                action.text
            ]
        default:
            return state
    }
}

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

const votes = (state = [], action) => {
    switch (action.type) {
        case 'POST_VOTE':
            return [
                ...state,
                {
                    index: action.index,
                    quantity: action.quantity
                }
            ]
        default:
            return state
    }
}

import { combineReducers } from 'redux'

export default combineReducers({
    words,
    votes,
    history,
    historyLoaded,
    submissions,
    user
})