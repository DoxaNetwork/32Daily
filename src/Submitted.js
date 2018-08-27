import React, { Component } from 'react'
import { connect } from 'react-redux'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'

import { loadSubmittedWords, initTokenBalance, updateAvailableVotes, initAccount } from './redux'
import { dayOfWeek, month } from './utils/helpers'


import contract from 'truffle-contract'
import { getContract } from './DappFunctions'

import DoxaHubContract from '../build/contracts/DoxaHub.json'
const doxaHubContract = contract(DoxaHubContract)


class SubmittedWord extends Component {

    mapVotesToPercent() {
        return this.props.totalVotes === 0 ? 0 : (this.props.backing + this.props.pendingVotes) / this.props.totalVotes * 100;
    }

    render() {
        const pendingClass = this.props.pendingVotes !== 0 || this.props.votedAlready ? 'pending' : ''
        const votesPercent = this.mapVotesToPercent()

        return (
            <div className={`submittedWordContainer ${pendingClass}`} onClick={() => this.props.onClick(this.props.index)}>
                <div className="voteCount">
                    {this.props.backing + this.props.pendingVotes}
                </div>
                <div className="submittedWord">
                    <div className="submittedWordWord">{this.props.word}</div>
                    <div className="votingBar" style={{width: `${votesPercent}%`}}> </div>
                    <div className="identity2"><Link to={'1000/' + this.props.poster}> {this.props.poster.substring(0,6)}</Link></div>
                </div>
            </div>
        )
    }
}

const mapStateToProps6 = state => ({
    totalVotes: state.pendingVotes.totalVotes
})
const mapDispatchToProps5 = dispatch => ({
    onClick: index => dispatch({type: 'SET_PENDING_VOTE', index})
})

export const SubmittedWordRedux = connect(
    mapStateToProps6,
    mapDispatchToProps5
)(SubmittedWord)

class SubmittedWords extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pastVotes: {}
        }
    }

    componentDidMount() {
        this.props.loadSubmittedWords()
        this.props.initTokenBalance() //this should happen higher up and be renamed
    }

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

        const submittedWords = this.props.submittedWords.map(obj =>
            <SubmittedWordRedux 
                key={obj.index} 
                index={obj.index} 
                word={obj.word} 
                poster={obj.poster}
                backing={obj.backing} 
                votedAlready={this.state.pastVotes[obj.index] !== undefined} 
                pendingVotes={this.props.pendingVotes[obj.index] !== undefined ? this.props.pendingVotes[obj.index] : 0} />
        );

        const saveButton = this.props.unsavedVotes ? (
                <div className="saveContainer">
                    <Button text="Save" onClick={() => this.props.persistVotes(this.props.pendingVotes)}/>
                    <Button text="Clear" onClick={this.props.clearVotes}/>
                </div>
               ) : '';

        const votesRemainingPercent = availableVotes / this.props.tokenBalance * 100;
        const votesSpentPercent = 100 - votesRemainingPercent;

        return (
            <div>
                <div className="wordFactory">
                <div className="sectionTitle">
                    {"Choose tomorrow's headline"}
                    <div className="sectionSubTitle">for {dayOfWeek(tomorrow)} {month(tomorrow)} {tomorrow.getUTCDate()}</div>
                </div>
                    <div className="submittedWords">
                        <div className="wordFactoryTitle">
                            <div className="voteText">{availableVotes} of your {this.props.tokenBalance} votes remaining</div>
                            <div className="voteBarsContainer">
                                <div style={{width:`${votesRemainingPercent}%`}} className="votesRemaining"></div>
                                <div style={{width:`${votesSpentPercent}%`}} className="votesSpent"></div>
                            </div>
                        </div>
                        <div className="saveSpaceHolder">
                            {saveButton}
                        </div>
                        <CSSTransitionGroup
                            transitionName="opacity"
                            transitionEnterTimeout={5000}
                            transitionLeaveTimeout={300}>
                            {submittedWords}
                        </CSSTransitionGroup>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps4 = state => ({
    submittedWords: state.submissions,
    tokenBalance: state.user.balance,
    availableVotes: state.user.available,
    account: state.user.account,
    pendingVotes: state.pendingVotes.pendingVotes,
    unsavedVotes: state.pendingVotes.unsavedVotes,
    totalPendingVotes: state.pendingVotes.totalPending
})

const mapDispatchToProps4 = dispatch => ({
    loadSubmittedWords: () => dispatch(loadSubmittedWords()),
    persistVotes: (pendingVotes) => dispatch({type: 'PERSIST_VOTES', pendingVotes}),
    clearVotes: () => dispatch({type: 'CLEAR_VOTES'}),
    initTokenBalance: () => {
        dispatch(initTokenBalance())
        dispatch(updateAvailableVotes())
        dispatch(initAccount())
    }
})

export const SubmittedWordsRedux = connect(
    mapStateToProps4,
    mapDispatchToProps4
)(SubmittedWords)


class Button extends Component {
    async submit() {
        await this.props.onClick()
    }
    render() {
        return (
            <button className="save unsaved" onClick={() => this.submit()}>{this.props.text}</button>
        )
    }
}