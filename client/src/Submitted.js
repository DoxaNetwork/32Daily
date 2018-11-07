import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
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
        const submittedWords = this.props.submittedWords.map(obj =>
            <CSSTransition
                key={"" + obj.index + obj.chain} 
                classNames="opacity"
                appear
                timeout={{ enter: 300, exit: 300 }}>
                <ContentCard 
                    // key={"" + obj.index + obj.chain} 
                    index={obj.index} 
                    date={obj.date} 
                    content={obj.content} 
                    poster={obj.poster}
                    user={this.props.users[obj.poster]}
                    approvedChain={this.props.users[obj.approvedChains[0]]}
                    backing={obj.votes} 
                    onClick={this.props.onClick}
                    chain={obj.chain} />
            </CSSTransition>
        );

        return (
                <>
                { submittedWords.length > 0 ? (
                    <TransitionGroup>
                    {submittedWords}
                    </TransitionGroup>
                ) : (
                    <NothingHereYet>
                        <NavLink activeClassName="navLink-active" to={`/${this.props.match.path.split('/')[1]}/create`}>
                            Nothing here yet. <br/>Why don't you be the first?
                        </NavLink>
                    </NothingHereYet>
                )}
                </>
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