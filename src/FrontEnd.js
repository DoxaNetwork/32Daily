import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"; 
import { CSSTransitionGroup } from 'react-transition-group'
import contract from 'truffle-contract'

import { getContract, getCurrentAccount, getAllLinks, getAllPastWords, getPreHistory } from './DappFunctions'
import BackableTokenContract from '../build/contracts/BackableToken.json'
import toAscii from './utils/helpers'
import './FrontEnd.css'

const token = contract(BackableTokenContract)
let tokenInstance;
let currentAccount;

class FrontEnd extends Component {

	constructor(props){
		super(props);
		this.state = {
			'submittedWords': [],
			'pendingVotes': {},
			'unsavedVotes': false,
			'creation': false
		}
	}

	async componentWillMount() {
		// initialize global state
		tokenInstance = await getContract(token);
		currentAccount = await getCurrentAccount();

        const submittedWords = await getAllLinks();

        this.setState({submittedWords})
    }

    mapPost(post) {
    	return {'word': toAscii(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
    }

    async postLink(content) {
    	this.setState({creation: true})
    	const result = await tokenInstance.postLink(content, { from: currentAccount})
        const newPost = this.mapPost(result.logs[0].args);
        this.setState({ submittedWords: [newPost, ...this.state.submittedWords ] })
    }

    async publish() {
    	const result = await tokenInstance.publish({from: currentAccount});
    }

    toggleCreation() {
    	this.setState({creation: !this.state.creation})	
    }

    creationClass() {
    	return this.state.creation ? 'border': '';
    }


    submissionText() {
    	return this.state.creation ? 'Hide current submissions' : 'Show current submissions';
    }

	render() {
		const submittedWordsBlock = this.state.creation ? (
			<SubmittedWords submittedWords={this.state.submittedWords}/>
			) : ('');

		return (
			<div>
				<Header/>
				<div className="appContainer">
					{submittedWordsBlock}
					<div>
						<PublishedWords/>
						<NextWord onSubmit={this.postLink.bind(this)}/>
						<div className="showSubmissions link" onClick={this.toggleCreation.bind(this)}>{this.submissionText()}</div>
					</div>
				</div>

				<div className="footer">
				</div>
			</div>
		)
	}
}

class PublishedWords extends Component {

	constructor(props) {
		super(props);
		this.state = {
			'publishedWords': []
		}
	}

	async componentWillMount() {
        const publishedWords = await getAllPastWords();

        this.setState({publishedWords})
    }

	async loadFullHistory() {
    	const publishedWords = await getPreHistory();
    	this.setState({ publishedWords: [...publishedWords, ...this.state.publishedWords ] })
    }

	render() {
		const publishedWords = this.state.publishedWords.map(word => 
			<PublishedWord  key={word.content} word={word} />
		);

		return (
			<div>
				<div className="showHistory link" onClick={this.loadFullHistory.bind(this)}>Show full history</div>
				<div className="wordStreamInner">
					<CSSTransitionGroup
          				transitionName="example"
          				transitionEnterTimeout={5000}
          				transitionLeaveTimeout={300}>
						{publishedWords}
					</CSSTransitionGroup>
				</div>
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
		}
	}

	setPendingVote(index) {
    	let pendingVotes = {...this.state.pendingVotes}

    	pendingVotes[index] ? pendingVotes[index.toNumber()] += 1 : pendingVotes[index.toNumber()] = 1;
    	this.setState({pendingVotes, unsavedVotes: true});
    }

    async persistVotes() {
    	const indexes = Object.keys(this.state.pendingVotes);
    	const votes = Object.values(this.state.pendingVotes);

    	const result = await tokenInstance.backPosts(indexes, votes, { from: currentAccount })
    	this.setState({unsavedVotes: false});
    }

	render() {
		const currentTime = new Date();
		const hoursRemaining = 23 - currentTime.getUTCHours();
		const minutesRemaining = 60 - currentTime.getUTCMinutes();

		const submittedWords = this.props.submittedWords.map(obj =>
			<SubmittedWord key={obj.index} word={obj.word} backing={obj.backing} index={obj.index} onClick={this.setPendingVote.bind(this)}/>
		);

		// const saveButton = this.state.unsavedVotes ? ( 
		// 	<CSSTransitionGroup
		// 		transitionName="example"
		// 		transitionAppear={true}
		// 	    transitionAppearTimeout={20000}
		// 	    transitionEnter={false}
		// 	    transitionLeave={false}>
		// 		<Save showCreation={this.setCreation.bind(this)} onSubmit={this.postLink.bind(this)}/>
		// 	</CSSTransitionGroup>
		// 	) : ( '' );
		const saveButton ='';

		return (
			<CSSTransitionGroup
				transitionName="example"
				transitionAppear={true}
			    transitionAppearTimeout={20000}
			    transitionEnter={false}
			    transitionLeave={false}>

				<div className="wordFactory" >
					<div className="submittedWords">
						<div className="wordFactoryTitle">
							<div>What comes next?</div>
							<div>Voting ends in {hoursRemaining} hours and {minutesRemaining} minutes</div>
						</div>
						<div style={{height:'50px', margin: 'auto', textAlign: 'center'}}>
							{saveButton}
						</div>
						<CSSTransitionGroup
          					transitionName="example"
          					transitionEnterTimeout={5000}
          					transitionLeaveTimeout={300}>
							{submittedWords}
						</CSSTransitionGroup>
					</div>
				</div>
			</CSSTransitionGroup>
		)
	}
}

class Header extends Component {
	render() {
		const currentTime = new Date();
		const timeConsumedPercent = (currentTime.getUTCHours() * 60 + currentTime.getUTCMinutes()) / (24 * 60) * 100;

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
			</div>
		)
	}
}				

class SubmittedWord extends Component {

	constructor(props) {
		super(props);

		this.maxVotes = 6;

		this.state = { 
			backing: this.props.backing,
			published: this.props.backing >= this.maxVotes,
		}
	}

	mapVotesToPixels(votes) {
		const maxVotes = 6;
		const fullWidth = 346;
		const multiplier = fullWidth / maxVotes;

		return votes * multiplier;
	}

	mapVotesToMargin(votes) {
		const pixels = this.mapVotesToPixels(votes);
		const maxMargin = 346;
		return 54;
	}

	async handleClick() {
		if(this.state.published) {
			return;
		}

		this.props.onClick(this.props.index);

		const backing = this.state.backing + 1;
		if (backing >= this.maxVotes) {
			this.setState({published: true});
		}

		this.setState({backing})
	}

	render() {
		return (

			<div className={this.state.published ? "published submittedWordContainer" : "submittedWordContainer"} onClick={this.handleClick.bind(this)}>
				<div className="voteCount">
					{this.state.backing}
				</div>
				<div className="submittedWord">
					{this.props.word}
				</div>
				<div className="votingBar2" style={{width: `${this.mapVotesToPixels(this.state.backing)}px`, margin: `0 0 0 ${this.mapVotesToMargin(this.state.backing)}px`}}> </div>
			</div>

		)
	}
}
 
class PublishedWord extends Component {

	constructor(props) {
		super(props);
	}

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
		this.state = {content: ''}
	}

	handleContentChange(event) {
        this.setState({content: event.target.value})
    }

    async submit(content) {
    	await this.props.onSubmit(content);
    	this.setState({content: ''})
    }

	render() {
		return (
			<div className="nextWordContainer">
				<div className="submittedWordContainer">
					<div  className="nextWord">
						<input type="text" placeholder="what comes next?" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
					</div>
					<button onClick={() => this.submit(this.state.content)}>Submit</button>
				</div>
			</div>
		)
	}
}

class Save extends Component {

	constructor(props) {
		super(props);
		this.state = {content: ''}
	}

    async submit(content) {
    	await this.props.onSubmit(content);
    }

	render() {
		return (
			<div className="nextWordContainer save">
				<button onClick={() => this.submit(this.state.content)}>Save</button>
			</div>
		)
	}
}
/*<button className="save ready" onClick={this.updateVotes.bind(this)}>Save</button>
					<button className="save ready" onClick={this.publish.bind(this)}>Publish</button>*/

export default FrontEnd