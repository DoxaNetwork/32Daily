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
            return [action.newPost, ...state]
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
            return [...state, {message, timeStamp}]
        case 'CLEAR_NOTIFICATION':
            return state.slice(1)
        default:
            return state
    }
}

const modals = (state = [], action) => {
    switch (action.type) {
        case 'NEW_MODAL':
            const { message, header } = action;
            return [...state, {message, header}]
        case 'CLEAR_MODAL':
            return state.slice(1)
        default:
            return state
    }
}

const freqReducer = combineReducers({
    history,
    historyLoaded,
    submissions,
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
    modals
})

export default rootReducer;
