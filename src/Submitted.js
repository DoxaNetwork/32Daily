import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'

import { loadSubmissions, loadBalance, loadAvailableBalance, loadAccount, submitVotes, clearVotes, pendVote } from './actions'
import { dayOfWeek, month } from './utils/helpers'


import contract from 'truffle-contract'
import { getContract } from './DappFunctions'

import DoxaHubContract from '../build/contracts/DoxaHub.json'
const doxaHubContract = contract(DoxaHubContract)

import { Button } from './styledComponents'
import { ContentCard } from './ContentCard.js'
import styled from 'styled-components';

const VoteBarsContainer = styled.div`
    border-radius: var(--border-radius);
    display: flex;
    overflow: hidden;
    height: 5px;
`
const SpentVotesBar = styled.div`
    background-color: var(--lightgray);
    transition: width 300ms ease-out;
`
const RemainingVotesBar = styled.div`
    background: linear-gradient(90deg,var(--main-color), var(--secondary-color));
    transition: width 300ms ease-out;
`

const LinkToUser = styled(Link)`
    color: var(--gray);
    float: right;
    padding-right: 15px;
`

const VoteText = styled.div`
    text-align: center;
    color: gray;
    margin-bottom: 10px;
`

const WordFactory = styled.div`
    border-right: 2px solid var(--lightgray);
`
const WordFactoryTitle = styled.div`
    width: 75%;
    margin:auto;
`
const SubmittedWordsContainer = styled.div`
    padding-top: 30px;
`

class Button2 extends Component {
    render() {
        return (
            <Button className="save unsaved" onClick={this.props.onClick}>{this.props.text}</Button>
        )
    }
}

class _SubmittedWords extends Component {
    state = {
        pastVotes: {}
    }

    componentDidMount() {
        this.props.load()
    }

    // do something better with this
    async componentWillMount() {
        const doxaHub = await getContract(doxaHubContract);
        let pastVotes = {}
        const version = await doxaHub.currentVersion();
        const filter = doxaHub.PostBacked({backer: this.props.account, version:version}, {fromBlock:0})
        filter.get((e,r) => {
            for(let i = 0; i < r.length; i++) {
                let index = r[i].args.postIndex.toNumber();
                pastVotes[index] = 1;
            }
            this.setState({pastVotes})
        })
    }

    setPendingVote(index) {
        // this should be moved to action creator?
        if(this.props.availableVotes - this.props.totalPendingVotes === 0 ) return false;
    }

    async persistVotes() {
        const pastVotes = Object.assign(this.state.pastVotes, this.state.pendingVotes)
        this.setState({pastVotes})
    }

    render() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1)

        const availableVotes = this.props.availableVotes - this.props.totalPendingVotes;
        const votesRemainingPercent = availableVotes / this.props.tokenBalance * 100;
        const votesSpentPercent = 100 - votesRemainingPercent;

        const submittedWords = this.props.submittedWords.map(obj =>
            <ContentCard 
                key={obj.index} 
                index={obj.index} 
                word={obj.word} 
                poster={obj.poster}
                backing={obj.backing} 
                onClick={this.props.onClick} />
        );

        const saveButton = this.props.unsavedVotes ? (
            <div className="saveContainer">
                <Button2 text="Save" onClick={() => this.props.submitVotes(this.props.pendingVotes)}/>
                <Button2 text="Clear" onClick={this.props.clearVotes}/>
            </div>
        ) : '';


        return (
            <WordFactory>
                <div className="sectionTitle">
                    {"Choose tomorrow's headline"}
                    <div className="sectionSubTitle">for {dayOfWeek(tomorrow)} {month(tomorrow)} {tomorrow.getUTCDate()}</div>
                </div>
                <SubmittedWordsContainer>
                    <WordFactoryTitle>
                        <VoteText>{availableVotes} of your {this.props.tokenBalance} votes remaining</VoteText>
                        <VoteBarsContainer>
                            <RemainingVotesBar style={{width:`${votesRemainingPercent}%`}}/>
                            <SpentVotesBar style={{width:`${votesSpentPercent}%`}}/>
                        </VoteBarsContainer>
                    </WordFactoryTitle>
                    <div className="saveSpaceHolder">
                        {saveButton}
                    </div>
                    <CSSTransitionGroup
                        transitionName="opacity"
                        transitionEnterTimeout={5000}
                        transitionLeaveTimeout={300}>
                        {submittedWords}
                    </CSSTransitionGroup>
                </SubmittedWordsContainer>
            </WordFactory>
        )
    }
}

const mapStateToProps = state => ({
    submittedWords: state.freq1.submissions,
    tokenBalance: state.user.balance,
    availableVotes: state.user.available,
    account: state.user.account,
    pendingVotes: state.freq1.pendingVotes.pendingVotes,
    unsavedVotes: state.freq1.pendingVotes.unsavedVotes,
    totalVotes: state.freq1.pendingVotes.totalVotes,
    totalPendingVotes: state.freq1.pendingVotes.totalPending
})

const mapDispatchToProps = dispatch => ({
    submitVotes: (pendingVotes) => dispatch(submitVotes(pendingVotes, 'freq1')),
    onClick: index => dispatch(pendVote(index, 'freq1')),
    clearVotes: () => dispatch(clearVotes()),
    load: () => {
        dispatch(loadSubmissions('freq1'))
        dispatch(loadBalance())
        dispatch(loadAvailableBalance())
        dispatch(loadAccount())
    }
})

export const SubmittedWords = connect(
    mapStateToProps,
    mapDispatchToProps
)(_SubmittedWords)

const mapStateToProps2 = state => ({
    submittedWords: state.freq2.submissions,
    tokenBalance: state.user.balance,
    availableVotes: state.user.available,
    account: state.user.account,
    pendingVotes: state.freq2.pendingVotes.pendingVotes,
    unsavedVotes: state.freq2.pendingVotes.unsavedVotes,
    totalVotes: state.freq2.pendingVotes.totalVotes,
    totalPendingVotes: state.freq2.pendingVotes.totalPending
})

const mapDispatchToProps2 = dispatch => ({
    submitVotes: (pendingVotes) => dispatch(submitVotes(pendingVotes, 'freq2')),
    onClick: index => dispatch(pendVote(index, 'freq2')),
    clearVotes: () => dispatch(clearVotes()),
    load: () => {
        dispatch(loadSubmissions('freq2'))
        dispatch(loadBalance())
        dispatch(loadAvailableBalance())
        dispatch(loadAccount())
    }
})

export const SubmittedWords2 = connect(
    mapStateToProps2,
    mapDispatchToProps2
)(_SubmittedWords)