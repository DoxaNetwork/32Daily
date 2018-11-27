import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components';

import { loadSubmissions, submitVote, loadPublishTime } from './actions'
import { ContentCard } from './ContentCard.js'
import { ClimbingBoxLoader } from 'react-spinners';
import { FaChevronDown } from "react-icons/fa";


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

const override = css`
    margin: 20px auto;
`

const Sort = styled.div`
    padding-top: 15px;
    display:flex;
    color: var(--gray);
    align-items:center;

    button { 
        padding:0 0 0 5px;
        background: none;
        border: none;
        font-size: 1em;
        font-weight: 800;
        color: var(--primary); 
        display: flex;
        align-items: center; 
        cursor:pointer;
        outline: none;
        svg {
            padding-left: 10px;
        }

        &:hover {
            color: var(--bright);
        }
    }
`

class _SubmittedWords extends Component {
    state = {
        sort: "newest",
        sorting: false
    }

    componentDidMount() {
        this.props.load()
    }

    toggleSort() {
        let newSort;
        if (this.state.sort == "newest") {
            newSort = "top"
        } else {
            newSort = "newest"
        }
        this.setState({sort: newSort, sorting: true})
        setTimeout(() => this.setState({sorting: false}), 500)
    }

    render() {
        const sortTop = (i,j) => (j.votes - i.votes)
        const sortNewest = (i,j) => (j.date - i.date)
        const sortFns = {"newest": sortNewest, "top": sortTop}
        const sortFn = sortFns[this.state.sort];

        const submittedWords = this.props.submittedWords.sort(sortFn).map(obj =>
            <CSSTransition
                key={"" + obj.index + obj.chain} 
                classNames="opacity"
                appear
                timeout={{ enter: 300, exit: 300 }}>
                <ContentCard 
                    index={obj.index} 
                    date={obj.date} 
                    content={obj.content} 
                    poster={obj.poster}
                    user={this.props.users[obj.poster]}
                    approvedChain={this.props.users[obj.approvedChains[0]]}
                    backing={obj.votes} 
                    onClick={this.props.onClick}
                    chain={obj.chain} 
                    pending={obj.pending}
                    pendingVotes={obj.pendingVotes}/>
            </CSSTransition>
        );

        const pendingSubmissions = this.props.pendingSubmissions.map(obj =>
            <CSSTransition
                key={obj.hash} 
                classNames="opacity"
                appear
                timeout={{ enter: 300, exit: 300 }}>
                <ContentCard 
                    content={obj.content} 
                    poster={obj.poster}
                    user={this.props.users[obj.poster]}
                    backing={obj.votes} 
                    onClick={this.props.onClick}
                    chain={obj.chain} 
                    pending={Boolean(obj.hash)}/>
            </CSSTransition>
        );

        return (
            <>
                <Sort>sorted by <button onClick={() => this.toggleSort()}><span>{this.state.sort}</span><FaChevronDown/></button></Sort>
                { this.props.loaded && !this.state.sorting && 
                    <>
                    { submittedWords.length > 0 ? (
                        <TransitionGroup>
                        {pendingSubmissions}
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
                }
                <ClimbingBoxLoader
                      className={`${override}`}
                      color={'#266DD3'}
                      loading={!this.props.loaded || this.state.sorting}
                    />
            </>
        )
    }
}

const mapFreqToStateToProps = freq => (
    state => ({
        submittedWords: state[freq].submissions,
        pendingSubmissions: state[freq].pendingSubmissions,
        loaded: state[freq].submissionsLoaded,
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