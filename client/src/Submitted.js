import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'

import { loadSubmissions, loadBalance, loadAvailableBalance, loadAccount, submitVote, loadPublishTime } from './actions'
import { ContentCard } from './ContentCard.js'


class _SubmittedWords extends Component {
    componentDidMount() {
        this.props.load()
    }

    render() {
        const submittedWords = this.props.submittedWords.map(obj =>
            <ContentCard 
                key={obj.poster + obj.word} 
                index={obj.index} 
                word={obj.word} 
                poster={obj.poster}
                user={this.props.users[obj.poster]}
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
        users: state.users,
    })
)

const mapFreqToDispatchToProps = freq => (
    dispatch => ({
        onClick: index => dispatch(submitVote(index, freq)),
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