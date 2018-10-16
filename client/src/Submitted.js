import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import styled from 'styled-components';

import { loadSubmissions, loadBalance, loadAvailableBalance, loadAccount, submitVote, loadPublishTime } from './actions'
import { ContentCard } from './ContentCard.js'


const NothingHereYet = styled.div`
    text-align: center;
    font-size: 1.2em;
    margin-top: 20px;

    a {
        color: var(--primary);
        text-decoration: none;
        font-weight:800;
    }
    a:hover {
        color: var(--bright);
    }
`
class _SubmittedWords extends Component {
    componentDidMount() {
        this.props.load()
    }

    render() {
        // let submittedWords
        const submittedWords = this.props.submittedWords.length ? (
            this.props.submittedWords.map(obj =>
                <ContentCard 
                    key={obj.poster + obj.word} 
                    index={obj.index} 
                    word={obj.word} 
                    poster={obj.poster}
                    user={this.props.users[obj.poster]}
                    backing={obj.backing} 
                    onClick={this.props.onClick} />
            )
        ) : (
            <NothingHereYet>
                <NavLink activeClassName="navLink-active" to={`${this.props.match.path}/create`}>
                    Nothing here yet. <br/>Why don't you be the first?
                </NavLink>
            </NothingHereYet>
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
export const SubmittedWords1 = withRouter(connect(
    mapFreqToStateToProps('freq1'),
    mapFreqToDispatchToProps('freq1')
)(_SubmittedWords))

export const SubmittedWords2 = withRouter(connect(
    mapFreqToStateToProps('freq2'),
    mapFreqToDispatchToProps('freq2')
)(_SubmittedWords))

export const SubmittedWords3 = withRouter(connect(
    mapFreqToStateToProps('freq3'),
    mapFreqToDispatchToProps('freq3')
)(_SubmittedWords))