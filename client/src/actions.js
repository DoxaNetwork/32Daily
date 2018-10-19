// ========== new content ==================
export const submitContent = (text, freq) => ({
    type: 'SUBMIT_CONTENT',
    text,
    freq
})

// ========== published content ============
export const loadLatestHistory = (freq) => ({
    type: 'LOAD_LATEST_HISTORY',
    freq
})

export const loadAllHistory = (freq) => ({
    type: 'LOAD_ALL_HISTORY',
    freq
})

// ========== submitted content ============
export const loadSubmissions = (freq) => ({
    type: 'LOAD_SUBMISSIONS',
    freq
})

export const loadPublishTime = (freq) => ({
    type: 'LOAD_PUBLISH_TIME',
    freq
})


// ========== user info ====================
export const loadAccount = () => ({
    type: 'LOAD_ACCOUNT'
})

export const loadUser = (address) => ({
    type: 'LOAD_USER',
    address: address
})

export const loadUserIfNeeeded = (address) => ({
    type: 'LOAD_USER_IF_NEEDED',
    address: address
})

// ========== votes ========================
export const submitVote = (index, chain, freq) => ({
    type: 'SUBMIT_VOTE',
    index,
    chain,
    freq
})
