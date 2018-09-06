// ========== new content ==================
export const submitContent = (text) => ({
    type: 'SUBMIT_CONTENT',
    text
})

// ========== published content ============
export const loadLatestHistory = (freq) => ({
    type: 'LOAD_LATEST_HISTORY',
    freq
})

export const loadAllHistory = () => ({
    type: 'LOAD_ALL_HISTORY'
})

// ========== submitted content ============
export const loadSubmissions = (freq) => ({
    type: 'LOAD_SUBMISSIONS',
    freq
})


// ========== user info ====================
export const loadBalance = () => ({
    type: 'LOAD_BALANCE'
})

export const loadAvailableBalance = () => ({
    type: 'LOAD_AVAILABLE_BALANCE'
})

export const loadAccount = () => ({
    type: 'LOAD_ACCOUNT'
})

// ========== votes ========================
export const submitVotes = (pendingVotes) => ({
    type: 'SUBMIT_VOTES',
    pendingVotes
})

export const clearVotes = () => ({
    type: 'CLEAR_VOTES'
})

export const pendVote = (index) => ({
    type: 'PEND_VOTE',
    index
})