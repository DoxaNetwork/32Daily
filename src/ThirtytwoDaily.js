import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import contract from 'truffle-contract'

import { getContract, getCurrentAccount, getAllLinks, preLoadHistory, getPreHistory } from './DappFunctions'
import BackableTokenContract from '../build/contracts/BackableToken.json'
import toAscii from './utils/helpers'
import './ThirtytwoDaily.css'

const token = contract(BackableTokenContract)
let tokenInstance;
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
		}
	}

	async componentWillMount() {
		// initialize global state
		tokenInstance = await getContract(token);
		currentAccount = await getCurrentAccount();
		const owner = await tokenInstance.owner();

        const submittedWords = await getAllLinks();
        this.setState({submittedWords, owner: owner === currentAccount})
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

    async postLink(content) {
    	const result = await tokenInstance.postLink(content, { from: currentAccount})
    	const filteredEvents = this.getEventsByType(result.logs, "LinkPosted")
        const newPost = this.mapPost(filteredEvents[0].args);
        this.setState({ showSubmissions: true, submittedWords: [newPost, ...this.state.submittedWords ] })
    }

    async publish() {
    	const result = await tokenInstance.publish({from: currentAccount});
    }

    toggleSubmissionView() {
    	this.setState({showSubmissions: !this.state.showSubmissions})	
    }

	render() {
		const submissionLink = this.state.showSubmissions ? 'Hide current submissions' : 'Show current submissions';

		const submittedWordsBlock = this.state.showSubmissions ? (
			<div className="rightSide">
				<SubmittedWords submittedWords={this.state.submittedWords}/>
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
						<div className="sectionTitle">The story so far</div>
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
	render() {
		const currentTime = new Date();
		const hoursRemaining = 23 - currentTime.getUTCHours();
		const minutesRemaining = 60 - currentTime.getUTCMinutes();
		const timeConsumedPercent = (currentTime.getUTCHours() * 60 + currentTime.getUTCMinutes()) / (24 * 60) * 100;

		const timerText = this.props.showTimerText ? (
			
				<div className="timerText">{hoursRemaining} hours and {minutesRemaining} minutes remaining</div> 
			
			) : '';
		return (

			<div>
				<div className="header">
					<div>Thirtytwo Daily</div>
					<div className="subtitle">A communal story, created one line per day</div>
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
			'tokenBalance': 0,
			'availableVotes': 0,
			'totalVotes': 0
		}
	}

	async componentWillMount() {
		const tokenBalanceBN = await tokenInstance.balanceOf(currentAccount);
		const availableVotesBN = await tokenInstance.availableToBackPosts(currentAccount);

		const tokenBalance = tokenBalanceBN.toNumber()
		const availableVotes = availableVotesBN.toNumber()

		let totalVotes = 0;
        for (let i = 0; i < this.props.submittedWords.length; i++) {
    		totalVotes += this.props.submittedWords[i].backing;
        }

        this.setState({totalVotes, tokenBalance, availableVotes})
    }

	setPendingVote(index, currentVotes) {
		if(this.state.availableVotes == 0 ) return false;
    	let pendingVotes = {...this.state.pendingVotes}
    	this.setState({totalVotes: this.state.totalVotes + 1})

    	pendingVotes[index] ? pendingVotes[index] += 1 : pendingVotes[index] = 1;
    	this.setState({pendingVotes, unsavedVotes: true, totalVotes: this.state.totalVotes + 1, availableVotes: this.state.availableVotes - 1});
    	return true;
    }

    async persistVotes() {
    	const indexes = Object.keys(this.state.pendingVotes);
    	const votes = Object.values(this.state.pendingVotes);

    	const result = await tokenInstance.backPosts(indexes, votes, { from: currentAccount })
    	this.setState({unsavedVotes: false});
    }

	render() {

		const submittedWords = this.props.submittedWords.map(obj =>
			<SubmittedWord totalVotes={this.state.totalVotes} key={obj.index} word={obj.word} backing={obj.backing} index={obj.index} onClick={this.setPendingVote.bind(this)}/>
		);

		const saveButton = this.state.unsavedVotes ? (
			    <Save onClick={this.persistVotes.bind(this)}/>
			   ) : '';

		const votesRemainingPercent = this.state.availableVotes / this.state.tokenBalance * 100;
		const votesSpentPercent = 100 - votesRemainingPercent;

		return (
			<div>
				<div className="wordFactory">
			    <div className="sectionTitle">Choose the next line</div>
					<div className="submittedWords">
						<div className="wordFactoryTitle">
							<div className="voteText">{this.state.availableVotes} of your {this.state.tokenBalance} votes remaining</div>
							<div className="voteBarsContainer">
								<div style={{width:`${votesRemainingPercent}%`}} className="votesRemaining"></div>
								<div style={{width:`${votesSpentPercent}%`}} className="votesSpent"></div>
							</div>
						</div>
						<div className="saveContainer">
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

	constructor(props) {
		super(props);

		this.state = { 
			backing: this.props.backing,
			pending: false,
		}
	}

	mapVotesToPixels(votes) {
		const fullWidth = 300;
		return this.props.totalVotes == 0 ? 0 : votes / this.props.totalVotes * fullWidth;
	}

	handleClick() {
		const availableVotes = this.props.onClick(this.props.index, this.state.backing);

		if (availableVotes) {
			const backing = this.state.backing + 1;
			this.setState({backing, pending: true})
		}
	}

	render() {
		const pendingClass = this.state.pending ? 'pending' : ''

		return (
			<div className={`submittedWordContainer ${pendingClass}`} onClick={this.handleClick.bind(this)}>
				<div className="voteCount">
					{this.state.backing}
				</div>
				<div className="submittedWord">
					{this.props.word}
				</div>
				<div className="votingBar" style={{width: `${this.mapVotesToPixels(this.state.backing)}px`}}> </div>
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
        this.setState({publishedWords, allPreLoaded})
    }

	async loadFullHistory() {
    	const publishedWords = await getPreHistory();
    	this.setState({ publishedWords: [...publishedWords, ...this.state.publishedWords ], allPreLoaded: true})
    }

	render() {
		const publishedWords = this.state.publishedWords.map(word => 
			<PublishedWord  key={word.content} word={word} />
		);

		const showAllHistoryLink = this.state.allPreLoaded ? '' : <div className="showHistory link" onClick={this.loadFullHistory.bind(this)}>Show full history</div>;

		return (
			<div>
				{showAllHistoryLink}
				<div className="wordStreamInner">
					<CSSTransitionGroup
          				transitionName="opacity"
          				transitionEnterTimeout={5000}
          				transitionLeaveTimeout={300}>
						{publishedWords}
					</CSSTransitionGroup>
				</div>
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
				<div className="sectionTitle">Continue the story</div>
				<form onSubmit={this.submit.bind(this)} className="nextWordContainer">
					<div  className="nextWord">
						<input autoComplete="off" required pattern=".{1,32}" title="No longer than 32 characters" type="text" placeholder="Suggest the next line" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
						<span className={`characterCount ${tooManyCharacters}`}>{this.state.charactersRemaining}</span>
					</div>
					<button className={`${unsavedState}`}type="submit">Submit</button>
				</form>
			</div>
		)
	}
}

class Save extends Component {
	async submit() {
		await this.props.onClick()
	}
	render() {
		return (
			<div className="nextWordContainer save">
				<button className="unsaved" onClick={() => this.submit()}>Save</button>
			</div>
		)
	}
}

export default ThirtytwoDaily