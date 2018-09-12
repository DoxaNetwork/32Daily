import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import styled from 'styled-components';
import contract from 'truffle-contract'

import { loadSubmissions, loadBalance, loadAvailableBalance, loadAccount, submitVotes, clearVotes, pendVote, loadPublishTime } from './actions'
import { ContentCard } from './ContentCard.js'


const LinkToUser = styled(Link)`
    color: var(--gray);
    float: right;
    padding-right: 15px;
`

class _SubmittedWords extends Component {
    componentDidMount() {
        this.props.load()
    }

    render() {
        const submittedWords = this.props.submittedWords.map(obj =>
            <ContentCard 
                key={obj.index} 
                index={obj.index} 
                word={obj.word} 
                poster={obj.poster}
                backing={obj.backing} 
                onClick={this.props.onClick} />
        );

        return (
            <CSSTransitionGroup
                transitionName="opacity"
                transitionEnterTimeout={5000}
                transitionLeaveTimeout={300}>
                {submittedWords}
            </CSSTransitionGroup>
        )
    }
}

const mapFreqToStateToProps = freq => (
    state => ({
        tokenBalance: state.user.balance,
        availableVotes: state.user.available,
        account: state.user.account,
        submittedWords: state[freq].submissions,
        pendingVotes: state[freq].pendingVotes.pendingVotes,
        unsavedVotes: state[freq].pendingVotes.unsavedVotes,
        totalVotes: state[freq].pendingVotes.totalVotes,
        totalPendingVotes: state[freq].pendingVotes.totalPending
    })
)

const mapFreqToDispatchToProps = freq => (
    dispatch => ({
        submitVotes: (pendingVotes) => dispatch(submitVotes(pendingVotes, freq)),
        onClick: index => dispatch(pendVote(index, freq)),
        clearVotes: () => dispatch(clearVotes()),
        load: () => {
            dispatch(loadSubmissions(freq))
            dispatch(loadBalance())
            dispatch(loadAvailableBalance())
            dispatch(loadAccount())
            dispatch(loadPublishTime(freq))
        }
    })
)
export const SubmittedWords1 = connect(
    mapFreqToStateToProps('freq1'),
    mapFreqToDispatchToProps('freq1')
)(_SubmittedWords)

export const SubmittedWords2 = connect(
    mapFreqToStateToProps('freq2'),
    mapFreqToDispatchToProps('freq2')
)(_SubmittedWords)

export const SubmittedWords3 = connect(
    mapFreqToStateToProps('freq3'),
    mapFreqToDispatchToProps('freq3')
)(_SubmittedWords)

export const SubmittedWords4 = connect(
    mapFreqToStateToProps('freq4'),
    mapFreqToDispatchToProps('freq4')
)(_SubmittedWords)

export const SubmittedWords5 = connect(
    mapFreqToStateToProps('freq5'),
    mapFreqToDispatchToProps('freq5')
)(_SubmittedWords)