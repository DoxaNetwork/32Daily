import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from './redux'

import rootSaga from './sagas'
import createSagaMiddleware from 'redux-saga'

const sagaMiddleware = createSagaMiddleware()
// const store = ...

// const store = createStore(
//   reducer,
//   applyMiddleware(sagaMiddleware)
// )

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    rootReducer,
    composeEnhancers(
        applyMiddleware(sagaMiddleware)
    )
)

sagaMiddleware.run(rootSaga)
// const store = createStore(
//     rootReducer,
//     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
//     )

import React, { Component } from 'react'
import { BrowserRouter, Link, NavLink, Route } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import contract from 'truffle-contract'

import { getContract, getCurrentAccount, getAllLinks, preLoadHistory, getPreHistory } from './DappFunctions'
import DoxaHubContract from '../build/contracts/DoxaHub.json'
import { ByteArrayToString, stringToChunkedArray, dayOfWeek, month } from './utils/helpers'
import './ThirtytwoDaily.css'

const doxaHubContract = contract(DoxaHubContract)
let doxaHub;
let currentAccount;

function mapPost(post) {
    return {'poster': post.owner, 'word': ByteArrayToString(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
}

class DoxaOne extends Component {
    render() {
        return (
            <Provider store={store}>
            <div>
            <ListofWordsRedux/>
            <BrowserRouter>
                <div>
                    <nav className="navbar">
                        <NavLink activeClassName="active" className="doxa1link" to="/1">Doxa1 </NavLink>
                        <NavLink activeClassName="active" className="doxa10link" to="/10">Doxa10 </NavLink>
                        <NavLink activeClassName="active" className="doxa100link" to="/100">Doxa100 </NavLink>
                        <NavLink  activeClassName="active" className="doxa1000link" to="/1000">Doxa1000 </NavLink>
                    </nav>
                    <Route path="/1" component={Doxa1}/>
                    <Route path="/10" component={Doxa10}/>
                    <Route path="/100" component={Doxa100}/>
                    <Route path="/1000" component={Doxa1000}/>
                </div>
            </BrowserRouter>
            </div>
            </Provider>
        )
    }
}
/*
            */

class Doxa1000 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#16d"}} title="Doxa1000" period="1000 hours"></ThirtytwoDaily>
        )
    }
}
// 10 minutes
// 100 minutes 1.5 hours
// 1000 minutes 17 hours
// 10000 minutes 6.9 days

class Doxa100 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#0b8"}} title="Doxa100" period="100 hours"></ThirtytwoDaily>
        )
    }
}

class Doxa10 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#f80"}} title="Doxa10" period="10 hours"></ThirtytwoDaily>
        )
    }
}

class Doxa1 extends Component {
    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#d04"}} title="Doxa1" period="hour"></ThirtytwoDaily>
        )
    }
}

class ThirtytwoDaily extends Component {

    constructor(props){
        super(props);
        this.state = {
            'pendingVotes': {},
            'unsavedVotes': false,
            'showSubmissions': false,
            owner: false,
        }
    }

    async publish() {
        await doxaHub.publish({from: currentAccount});
    }

    toggleSubmissionView() {
        this.setState({showSubmissions: !this.state.showSubmissions})
    }

    render() {
        // const publishButton = '';
        const publishButton = (
            <div className="publishButton">
                <button onClick={this.publish.bind(this)}>Publish</button>
            </div>
            );

        return (
            <div style={this.props.style}>
                {publishButton}
                <Header title={this.props.title} period={this.props.period} showTimerText={this.state.showSubmissions}/>
                <Route
                    exact path={this.props.match.url}
                    render={(props) => <SubmittedAndPublishedWords showSubmissions={this.state.showSubmissions} toggleSubmissionView={this.toggleSubmissionView.bind(this)} />}
                />
                <Route
                    path={this.props.match.url + '/:id'}
                    component={UserRedux}
                />

                <div className="footer">
                </div>
            </div>
        )
    }
}




// need to redux this one
class SubmittedAndPublishedWords extends Component {

    constructor(props) {
        super(props)
         this.state = {
            'pendingVotes': {},
            'unsavedVotes': false,
            owner: false,
        }
    }

    async componentWillMount() {
        doxaHub = await getContract(doxaHubContract);
        currentAccount = await getCurrentAccount();
        const owner = await doxaHub.owner();
        this.setState({
            owner: owner === currentAccount,
        })
    }

    mapPost(post) {
        return {'poster': post.owner, 'word': ByteArrayToString(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
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

        this.setState({submittedWords})
        return result;

    }

    render() {
        const submissionLink = this.props.showSubmissions ? 'Hide current submissions' : 'Show current submissions';

        const submittedWordsBlock = this.props.showSubmissions ? (
            <div className="rightSide">
                <SubmittedWordsRedux persistVotes={this.persistVotes.bind(this)}/>
            </div>
            ) : ('');

        const hidden = this.props.showSubmissions ? 'hidden' : '';

        return (
            <div>
                <div className="appContainer">
                    {submittedWordsBlock}
                    <div className={`rightSide ${hidden}`}>
                        <PublishedWordsRedux/>
                        <NextWordRedux/>
                    </div>
                </div>
                <div className="showSubmissions link" onClick={this.props.toggleSubmissionView.bind(this)}>{submissionLink}</div>
            </div>
        )
    }
}
                        // <NextWordRedux onSubmit={this.postLink.bind(this)}/>

class User extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userId: '',
            submittedWords: [],
            publishedWords: [],
        }
    }

    mapPost(post) {
        return {'poster': post.owner, 'word': ByteArrayToString(post.content), 'version': post.version.toNumber()}
    }

    async componentWillMount() {
        doxaHub = await getContract(doxaHubContract);
        const userId = this.props.match.params.id;

        const submittedWords = []
        const filter = doxaHub.LinkPosted({owner: userId}, {fromBlock:0})
        filter.get((e,r) => {
            for(let i = 0; i < r.length; i++) {
                const word = mapPost(r[i].args)
                submittedWords.push(word)
            }
            this.setState({submittedWords})
        })

        const publishedWords = []
        const filter2 = doxaHub.Published({owner: userId}, {fromBlock:0})
        filter2.get((e,r) => {
            for(let i = 0; i < r.length; i++) {
                const word = this.mapPost(r[i].args)
                publishedWords.push(word)
            }
            this.setState({publishedWords})
        })

        this.setState({
            userId
        })
    }

    render() {
        const submittedWords = this.state.submittedWords.map(obj =>
            <SubmittedWord
                key={obj.word}
                index={obj.index}
                word={obj.word}
                poster={obj.poster}
                backing={obj.backing}/>
        );

        const publishedWords = this.state.publishedWords.map(obj =>
            <SubmittedWord
                key={obj.word}
                index={0}
                word={obj.word}
                poster={obj.poster}
                backing={0}/>
        );
        return (
            <div>
                <div className="userContainer">
                    <div className="row">
                        <div>user id</div>
                        <div className="row-value">{this.state.userId.substring(0,6)}</div>
                    </div>
                    <div className="row">
                        <div>token balance</div>
                        <div className="row-value">{this.props.tokenBalance}</div>
                    </div>
                    <div className="row">
                        <div>available votes</div>
                        <div className="row-value">{this.props.availableVotes}</div>
                    </div>
                    <div className="row">
                        <div>submitted posts</div>
                        <div className="row-value">todo</div>
                    </div>
                    <div className="row">
                        <div>published posts</div>
                        <div className="row-value">todo</div>
                    </div>
                    <div className="address">{this.state.userId}</div>
                </div>
                <div className="user-submittedPosts">
                    <h2>Submitted Posts</h2>
                    {submittedWords}
                </div>
                <div className="user-submittedPosts">
                    <h2>Published Words</h2>
                    {publishedWords}
                </div>

            </div>
        )
    }
}

const mapStateToProps5 = state => ({
    tokenBalance: state.user.balance,
    availableVotes: state.user.available
})
const UserRedux = connect(
    mapStateToProps5
)(User)


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
                    <div className="title">{this.props.title}</div>
                    <div className="subtitle">Tiny curated message selected every {this.props.period}</div>
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

    componentDidMount() {
        this.props.loadSubmittedWords()
        this.props.initTokenBalance() //this should happen higher up and be renamed
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
                poster={obj.poster}
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

const mapStateToProps4 = state => ({
    submittedWords: state.submissions,
    tokenBalance: state.user.balance,
    availableVotes: state.user.available,
    account: state.user.account
})

const mapDispatchToProps4 = dispatch => ({
    loadSubmittedWords: () => dispatch(loadSubmittedWords()),
    initTokenBalance: () => {
        dispatch(initTokenBalance())
        dispatch(updateAvailableVotes())
        dispatch(initAccount())
    }
})

const SubmittedWordsRedux = connect(
    mapStateToProps4,
    mapDispatchToProps4
)(SubmittedWords)


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
                    <div className="identity2"><Link to={'1000/' + this.props.poster}> {this.props.poster.substring(0,6)}</Link></div>
                </div>
            </div>
        )
    }
}

class PublishedWords extends Component {
    async componentDidMount() {
        this.props.initHistory()
    }

    render() {
        const firstWord = this.props.publishedWords.map((word, index) => {
            return index == 0 ? <PublishedWord  key={word.content} word={word} /> : '';
        });

        const publishedWords = this.props.publishedWords.map((word, index) => {
            return index == 0 ? '' : <PublishedWord  key={word.content} word={word} />
        });

        const showAllHistoryLink = this.props.allPreLoaded ? '' : <div className="showHistory link" onClick={this.props.allHistory}>See full history</div>;

        return (
            <div>
                <div className="sectionTitle">Current mood</div>
                <div className="yesterday">
                    {firstWord}
                </div>
                <div className="sectionTitle">Past moods</div>
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

const mapStateToProps3 = state => ({
    publishedWords: state.history,
    allPreLoaded: state.historyLoaded
})

const mapDispatchToProps3 = dispatch => ({
    initHistory: () => dispatch(initHistory()),
    allHistory: () => dispatch(allHistory())
})

const PublishedWordsRedux = connect(
    mapStateToProps3,
    mapDispatchToProps3
)(PublishedWords)

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
                    <div className="identity">
                        <Link to={'1000/' + this.props.word.poster}> {this.props.word.poster.substring(0,6)}</Link>
                    </div>
                </div>
            </div>
        )
    }
}

class ListofWords extends Component {
    input = React.createRef()

    render() {
        const words = this.props.words.map(word =>
            <div>{word}</div>
            )

        return (
            <div>
                {words}
                <form>
                    <input ref={this.input} type="text"/>
                    <button type="submit" onClick={e => {
                        e.preventDefault()
                        this.props.onClick(this.input.current)
                    }}>Add it</button>
                </form>
            </div>
        )
    }
}

import { submitContent, initHistory, allHistory, loadSubmittedWords, initTokenBalance, updateAvailableVotes, initAccount } from './redux'
import { connect } from 'react-redux'
const mapStateToProps = state => ({
  words: state.words
})
const mapDispatchToProps = dispatch => ({
    onClick: something => dispatch(submitContent(something.value, 'me'))
})
// ​
const ListofWordsRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ListofWords)






class NextWord extends Component {

    constructor(props) {
        super(props);
        this.maxCharacters = 160;
        this.state = {
            content: '',
            charactersRemaining: this.maxCharacters
        }
    }

    handleContentChange(event) {
        const charactersRemaining = this.maxCharacters - event.target.value.length;
        this.setState({content: event.target.value, charactersRemaining})
    }

    submit(event) {
        // this now comes directly from redux
        this.props.onSubmit(this.state.content);
        this.setState({content: '', charactersRemaining: this.maxCharacters})
        event.preventDefault();
    }

    render() {
        const tooManyCharacters = this.state.charactersRemaining < 0 ? 'red' : '';
        const unsavedState = this.state.charactersRemaining < this.maxCharacters ? 'unsaved' : '';

        return (
            <div className="nextWordBlock">
                <div className="sectionTitle">What's happening today?</div>
                <form onSubmit={this.submit.bind(this)} className="nextWordContainer">
                    <div  className="nextWord">
                        <input autoComplete="off" required pattern=".{1,160}" title="No longer than 160 characters" type="text" placeholder="Write today's headline" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
                        <span className={`characterCount ${tooManyCharacters}`}>{this.state.charactersRemaining}</span>
                    </div>
                    <button className={`${unsavedState}`}type="submit">Submit</button>
                </form>
            </div>
        )
    }
}

const mapDispatchToProps2 = dispatch => ({
    onSubmit: value => dispatch(submitContent(value))
})

const NextWordRedux = connect(
    null,
    mapDispatchToProps2
)(NextWord)

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

export default DoxaOne