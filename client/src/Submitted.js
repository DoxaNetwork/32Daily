import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import styled from 'styled-components';

import { loadSubmissions, submitVote, loadPublishTime } from './actions'
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
        console.log(this.props.submittedWords)
        const submittedWords = this.props.submittedWords.length ? (
            this.props.submittedWords.map(obj =>
                <ContentCard 
                    key={obj.poster + obj.content} 
                    index={obj.index} 
                    word={obj.content} 
                    poster={obj.poster}
                    user={this.props.users[obj.poster]}
                    backing={obj.votes} 
                    onClick={this.props.onClick}
                    side={obj.side}
                    chain={obj.chain} />
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
        submittedWords: state[freq].submissions,
        users: state.users,
    })
)

const mapFreqToDispatchToProps = freq => (
    dispatch => ({
        onClick: (index, chain) => dispatch(submitVote(index, chain, freq)),
        load: () => {
            dispatch(loadSubmissions(freq))
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