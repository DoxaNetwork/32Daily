import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import contract from 'truffle-contract'

import { getContract, getCurrentAccount, getAllLinks, preLoadHistory, getPreHistory } from './DappFunctions'
import DoxaHubContract from '../build/contracts/DoxaHub.json'
import { toAscii, dayOfWeek, month } from './utils/helpers'
import './ThirtytwoDaily.css'

const doxaHubContract = contract(DoxaHubContract)
let doxaHub;
let currentAccount;

class ThirtytwoDaily extends Component {

    constructor(props){
        super(props);
        this.state = {
            'submittedWords': [],
            'pendingVotes': {},
            'unsavedVotes': false,
            'showSubmissions': false,
            owner: false,
            tokenBalance: 0,
            availableVotes: 0,
        }
    }

    async componentWillMount() {
        doxaHub = await getContract(doxaHubContract);
        currentAccount = await getCurrentAccount();
        const owner = await doxaHub.owner();

        const submittedWords = await getAllLinks();
        submittedWords.sort((a, b) => {return b.backing - a.backing})

        const linkPosted = doxaHub.LinkPosted()
        linkPosted.watch((e, r) => {
            const newPost = this.mapPost(r.args);
            this.setState({
                submittedWords: [...this.state.submittedWords, newPost ]
            })
        })

        let tokenBalance;
        let availableVotes;
        if (currentAccount !== undefined) {
            const tokenBalanceBN = await doxaHub.balanceOf(currentAccount);
            tokenBalance = tokenBalanceBN.toNumber();

            const availableVotesBN = await doxaHub.availableToTransfer(currentAccount);
            availableVotes = availableVotesBN.toNumber();
        } else {
            tokenBalance = 0;
            availableVotes = 0;
        }
        this.setState({
            tokenBalance,
            availableVotes,
            submittedWords, 
            owner: owner === currentAccount,
        })
    }

    mapPost(post) {
        return {'word': toAscii(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
    }

    getEventsByType(events, type) {
        let matchedEvents = []
        for (let i = 0; i < events.length; i++) {
            if (events[i].event === type) {
                matchedEvents.push(events[i])
            }
        }
        return matchedEvents;
    }

    async persistVotes(pendingVotes) {

        const submittedWords = this.state.submittedWords.map(word => {
            if(pendingVotes[word.index] !== undefined) {
                word.backing += pendingVotes[word.index];
            }
            return word;
        } )

        const indexes = Object.keys(pendingVotes);
        const votes = Object.values(pendingVotes);

        const result = await doxaHub.backPosts(indexes, votes, { from: currentAccount })

        submittedWords.sort((a, b) => {return b.backing - a.backing})

        const availableVotesBN = await doxaHub.availableToTransfer(currentAccount);
        const availableVotes = availableVotesBN.toNumber()

        this.setState({submittedWords, availableVotes})
        return result;

    }

    async postLink(content) {
        const result = await doxaHub.postLink(content, { from: currentAccount})

        const tokenBalanceBN = await doxaHub.balanceOf(currentAccount);
        const tokenBalance = tokenBalanceBN.toNumber();

        const availableVotesBN = await doxaHub.availableToTransfer(currentAccount);
        const availableVotes = availableVotesBN.toNumber()

        const filteredEvents = this.getEventsByType(result.logs, "LinkPosted")
        const newPost = this.mapPost(filteredEvents[0].args);

        this.setState({
            tokenBalance,
            availableVotes, 
            showSubmissions: true,
            submittedWords: [...this.state.submittedWords, newPost ]
        })
    }

    async publish() {
        await doxaHub.publish({from: currentAccount});
    }

    toggleSubmissionView() {
        this.setState({showSubmissions: !this.state.showSubmissions})
    }

    render() {
        const submissionLink = this.state.showSubmissions ? 'Hide current submissions' : 'Show current submissions';

        const submittedWordsBlock = this.state.showSubmissions ? (
            <div className="rightSide">
                <SubmittedWords availableVotes={this.state.availableVotes} tokenBalance={this.state.tokenBalance} persistVotes={this.persistVotes.bind(this)} submittedWords={this.state.submittedWords}/>
            </div>
            ) : ('');

        const publishButton = this.state.owner ? (
            <div className="publishButton">
                <button onClick={this.publish.bind(this)}>Publish</button>
            </div>
            ) : '';

        const hidden = this.state.showSubmissions ? 'hidden' : '';

        return (
            <div>
                {publishButton}
                <Header showTimerText={this.state.showSubmissions}/>
                <div className="appContainer">
                    {submittedWordsBlock}
                    <div className={`rightSide ${hidden}`}>
                        <PublishedWords/>
                        <NextWord onSubmit={this.postLink.bind(this)}/>
                    </div>
                </div>
                <div className="showSubmissions link" onClick={this.toggleSubmissionView.bind(this)}>{submissionLink}</div>

                <div className="footer">
                </div>
            </div>
        )
    }
}


class Header extends Component {
    constructor(props) {
        super(props)
        this.state = {
            time: new Date()
        }
    }
    componentDidMount() {
      this.interval = setInterval(() => this.setState({ time: new Date() }), 1000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    render() {
        const hoursRemaining = 23 - this.state.time.getUTCHours();
        const minutesRemaining = 59 - this.state.time.getUTCMinutes();
        const timeConsumedPercent = (this.state.time.getUTCHours() * 60 + this.state.time.getUTCMinutes()) / (24 * 60) * 100;

        const timerText = this.props.showTimerText ? (
                <div className="timerText">{hoursRemaining} hours and {minutesRemaining} minutes remaining</div> 
            ) : '';

        return (
            <div>
                <div className="header">
                    <div className="title">32Daily</div>
                    <div className="subtitle">Tiny curated headline posted at midnight UTC</div>
                </div>
                <CSSTransitionGroup
                    transitionName="timeBar"
                    transitionAppear={true}
                    transitionAppearTimeout={400}
                    transitionEnter={false}
                    transitionLeave={false}>
                    <div className="timeBar" style={{width: `${timeConsumedPercent}%`}}></div>
                </CSSTransitionGroup>
                {timerText}
            </div>
        )
    }
}


class SubmittedWords extends Component {

    constructor(props) {
        super(props);

        this.state = {
            'pendingVotes': {},
            'unsavedVotes': false,
            'totalVotesCast': 0,
            'totalPendingVotes': 0,
            pastVotes: {}
        }
    }

    async componentWillMount() {
        let totalVotesCast = 0;
        for (let i = 0; i < this.props.submittedWords.length; i++) {
            totalVotesCast += this.props.submittedWords[i].backing;
        }
        this.originalTotalVotes = totalVotesCast;
        this.setState({totalVotesCast})

        let pastVotes = {}
        const version = await doxaHub.currentVersion();
        const filter = doxaHub.PostBacked({backer: currentAccount, version:version}, {fromBlock:0})
        filter.get((e,r) => {
            for(let i = 0; i < r.length; i++) {
                let index = r[i].args.postIndex.toNumber();
                pastVotes[index] = 1;
            }
            this.setState({pastVotes})
        })
    }

    setPendingVote(index) {
        if(this.props.availableVotes - this.state.totalPendingVotes === 0 ) return false;

        let pendingVotes = {...this.state.pendingVotes}
        pendingVotes[index] ? pendingVotes[index] += 1 : pendingVotes[index] = 1;

        this.setState({pendingVotes, unsavedVotes: true, totalVotesCast: this.state.totalVotesCast + 1, totalPendingVotes: this.state.totalPendingVotes+1});
        return true;
    }

    async persistVotes() {
        await this.props.persistVotes(this.state.pendingVotes)
        const pastVotes = Object.assign(this.state.pastVotes, this.state.pendingVotes)
        this.setState({pastVotes, totalPendingVotes: 0})
        this.clearVotes()
    }

    clearVotes() {
        const totalVotesCast = this.state.totalVotesCast - this.state.totalPendingVotes;
        this.setState({totalVotesCast, pendingVotes: {}, unsavedVotes: false, totalPendingVotes: 0 })
    }

    render() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1)

        const availableVotes = this.props.availableVotes - this.state.totalPendingVotes;

        const submittedWords = this.props.submittedWords.map(obj =>
            <SubmittedWord 
                key={obj.index} 
                index={obj.index} 
                word={obj.word} 
                backing={obj.backing} 
                votedAlready={this.state.pastVotes[obj.index] !== undefined} 
                pendingVotes={this.state.pendingVotes[obj.index] !== undefined ? this.state.pendingVotes[obj.index] : 0}
                totalVotesCast={this.state.totalVotesCast} 
                onClick={this.setPendingVote.bind(this)}/>
        );

        const saveButton = this.state.unsavedVotes ? (
                <div className="saveContainer">
                    <Button text="Save" onClick={this.persistVotes.bind(this)}/>
                    <Button text="Clear" onClick={this.clearVotes.bind(this)}/>
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


class SubmittedWord extends Component {

    mapVotesToPercent() {
        return this.props.totalVotesCast === 0 ? 0 : (this.props.backing + this.props.pendingVotes) / this.props.totalVotesCast * 100;
    }

    handleClick() {
        this.props.onClick(this.props.index);
    }

    render() {
        const pendingClass = this.props.pendingVotes !== 0 || this.props.votedAlready ? 'pending' : ''
        const votesPercent = this.mapVotesToPercent()

        return (
            <div className={`submittedWordContainer ${pendingClass}`} onClick={this.handleClick.bind(this)}>
                <div className="voteCount">
                    {this.props.backing + this.props.pendingVotes}
                </div>
                <div className="submittedWord">
                    <div className="submittedWordWord">{this.props.word}</div>
                    <div className="votingBar" style={{width: `${votesPercent}%`}}> </div>
                </div>
            </div>
        )
    }
}

class PublishedWords extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'publishedWords': [],
            'allPreLoaded': false
        }
    }

    async componentWillMount() {
        const [publishedWords, allPreLoaded] = await preLoadHistory();
        publishedWords.reverse();
        const firstWord = publishedWords[0];
        this.setState({publishedWords, allPreLoaded})
    }

    async loadFullHistory() {
        const publishedWords = await getPreHistory();
        publishedWords.reverse();
        this.setState({ publishedWords: [...this.state.publishedWords, ...publishedWords], allPreLoaded: true})
    }

    render() {
        const publishedWords = this.state.publishedWords.map((word, index) => {
            return index == 0 ? '' : <PublishedWord  key={word.content} word={word} />
        });

        const firstWord = this.state.publishedWords.map((word, index) => {
            return index == 0 ? <PublishedWord  key={word.content} word={word} /> : '';
        });

        const showAllHistoryLink = this.state.allPreLoaded ? '' : <div className="showHistory link" onClick={this.loadFullHistory.bind(this)}>See full history</div>;

        return (
            <div>
                <div className="sectionTitle">What happened yesterday</div>
                <div className="yesterday">
                    {firstWord}
                </div>
                <div className="sectionTitle">What happened before that</div>
                <div className="wordStreamInner">
                    <CSSTransitionGroup
                        transitionName="opacity"
                        transitionEnterTimeout={5000}
                        transitionLeaveTimeout={300}>
                        {publishedWords}
                    </CSSTransitionGroup>
                </div>
                {showAllHistoryLink}
            </div>            
        )
    }
}
 
class PublishedWord extends Component {
    render() {
        return (
            <div key={this.props.word.content}>
                <div className="publishedWordContainer">
                    <div className="word">
                        {this.props.word.content}
                    </div>
                    <div className="date">
                        {this.props.word.date}
                    </div>
                </div>
            </div>
        )
    }
}
class NextWord extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            charactersRemaining: 32
        }
    }

    handleContentChange(event) {
        const charactersRemaining = 32 - event.target.value.length;
        this.setState({content: event.target.value, charactersRemaining})
    }

    submit(event) {
        this.props.onSubmit(this.state.content);
        this.setState({content: '', charactersRemaining: 32})
        event.preventDefault();
    }

    render() {
        const tooManyCharacters = this.state.charactersRemaining < 0 ? 'red' : '';
        const unsavedState = this.state.charactersRemaining < 32 ? 'unsaved' : '';

        return (
            <div className="nextWordBlock">
                <div className="sectionTitle">What's happening today?</div>
                <form onSubmit={this.submit.bind(this)} className="nextWordContainer">
                    <div  className="nextWord">
                        <input autoComplete="off" required pattern=".{1,32}" title="No longer than 32 characters" type="text" placeholder="Write today's headline" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
                        <span className={`characterCount ${tooManyCharacters}`}>{this.state.charactersRemaining}</span>
                    </div>
                    <button className={`${unsavedState}`}type="submit">Submit</button>
                </form>
            </div>
        )
    }
}

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

export default ThirtytwoDaily