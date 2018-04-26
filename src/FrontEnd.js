import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"; 
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import { CSSTransitionGroup } from 'react-transition-group' // ES6


import { getContract, getCurrentAccount, getAllLinks, getAllPastWords, getPreHistory } from './DappFunctions'
import BackableTokenContract from '../build/contracts/BackableToken.json'
import toAscii from './utils/helpers'
import './FrontEnd.css'
import contract from 'truffle-contract'

const token = contract(BackableTokenContract)
let tokenInstance;
let currentAccount;


class FrontEnd extends Component {

	constructor(props){
		super(props);
		this.state = {
			'submittedWords': [],
			'publishedWords': [],
			'pendingVotes': {},
			'unsavedVotes': false,
			'creation': false
		}
	}

	async componentWillMount() {
		// initialize global state
		tokenInstance = await getContract(token);
		currentAccount = await getCurrentAccount();


        const posts = await getAllLinks();
        const postObjs = posts.map(postObj => this.mapPost(postObj))
        console.log(postObjs)

        const publishedWords = await getAllPastWords();
        this.setState({publishedWords, 'submittedWords': postObjs})
    }

    mapPost(post) {
    	return {'word': toAscii(post.link), 'backing': post.backing.toNumber(), 'index': post.index}
    }

    async postLink(content) {
    	const result = await tokenInstance.postLink(content, { from: currentAccount})
        const newPost = this.mapPost(result.logs[0].args);
        this.setState({ submittedWords: [newPost, ...this.state.submittedWords ] })
    }

    async updateVotes() {
    	const indexes = Object.keys(this.state.pendingVotes);
    	const votes = Object.values(this.state.pendingVotes);

    	const result = await tokenInstance.backPosts(indexes, votes, { from: currentAccount })
    	this.setState({unsavedVotes: false});
    }

    setPendingVote(index) {
    	let pendingVotes = {...this.state.pendingVotes}

    	pendingVotes[index.toNumber()] ? pendingVotes[index.toNumber()] += 1 : pendingVotes[index.toNumber()] = 1;
    	this.setState({pendingVotes, unsavedVotes: true});
    }

    async publish() {
    	const result = await tokenInstance.publish({from: currentAccount});
    }

    toggleCreation() {
    	this.setState({creation: !this.state.creation})
    	
    }

    setCreation() {
    	this.setState({creation: true})

    }

    creationClass() {
    	return this.state.creation ? 'border': '';
    }

    async loadFullHistory() {
    	const publishedWords = await getPreHistory();
    	this.setState({ publishedWords: [...publishedWords, ...this.state.publishedWords ] })
        // this.setState({publishedWords, 'submittedWords': postObjs})

    }

    submissionText() {
    	return this.state.creation ? 'Hide current submissions' : 'Show current submissions';
    }

	render() {
		const publishedWords = this.state.publishedWords.map(word => 
			<PublishedWord  key={word.content} word={word} />
		);

		const submittedWords = this.state.submittedWords.map(obj =>
			<SubmittedWord key={obj.index} word={obj.word} backing={obj.backing} index={obj.index} onClick={this.setPendingVote.bind(this)}/>
		);

		const save = this.state.unsavedVotes ? ( 
			<CSSTransitionGroup
				transitionName="example"
				transitionAppear={true}
			    transitionAppearTimeout={20000}
			    transitionEnter={false}
			    transitionLeave={false}>
			<Save showCreation={this.setCreation.bind(this)} onSubmit={this.postLink.bind(this)}/>
			</CSSTransitionGroup>
			) : ( ''
			// <NextWord showCreation={this.setCreation.bind(this)} onSubmit={this.postLink.bind(this)}/>
			);

		const submittedWordsBlock = this.state.creation ? (
			<CSSTransitionGroup
				transitionName="example"
				transitionAppear={true}
			    transitionAppearTimeout={20000}
			    transitionEnter={false}
			    transitionLeave={false}>

				<div className="wordFactory" >
					<div className="submittedWords">
						<div className="wordFactoryTitle">
							What comes next?
						</div>
						<div style={{height:'50px', margin: 'auto', textAlign: 'center'}}>
						{save}
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
			) : ('');

		return (
			<div>
				<div className="topContainer">
					<div className="dontpanic">
						<div>Thirtytwo Daily</div>
						<div className="subtitle">A communal story, created one line per day</div>
					</div>
						<div className="timeBar"></div>
					<div className="appContainer">
						
						{submittedWordsBlock}
						 
						<div className={`wordStream ${this.creationClass()}`}>
						<div className="showHistory link" onClick={this.loadFullHistory.bind(this)}>Show full history</div>
							<div className={`wordStreamInner ${this.creationClass()}`}>
							<CSSTransitionGroup
		          				transitionName="example"
		          				transitionEnterTimeout={5000}
		          				transitionLeaveTimeout={300}>
								{publishedWords}
							</CSSTransitionGroup>
							</div>
						<NextWord showCreation={this.setCreation.bind(this)} onSubmit={this.postLink.bind(this)}/>
							<div className="showSubmissions link" onClick={this.toggleCreation.bind(this)}>{this.submissionText()}</div>
						</div>
					</div>
				</div>

				<div className="footer">
				</div>
			</div>
		)
	}
}

/*<div className="saveContainer">
									<button className="save ready" onClick={this.updateVotes.bind(this)}>Save</button>
									<button className="save ready" onClick={this.publish.bind(this)}>Publish</button>
								</div>


/*<div className="saveContainer">
									<button className="save ready" onClick={this.updateVotes.bind(this)}>Save</button>
									<button className="save ready" onClick={this.publish.bind(this)}>Publish</button>
								</div>

/*<div className="wordFactory">
					<div className="submittedWords">
						{submittedWords}
					</div>
					<NextWord onSubmit={this.postLink.bind(this)}/>
					<div className="saveContainer">
						<button className="save ready" onClick={this.updateVotes.bind(this)}>Save</button>
						<button className="save ready" onClick={this.publish.bind(this)}>Publish</button>
					</div>
				</div>*/
				

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

		// return maxMargin - pixels;

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
    	this.props.showCreation();
    	this.setState({content: ''})
    }

    isReady() {
    	return 'ready';
    	if (this.state.content !== '') {
    		return 'ready';
        }
    }

	render() {
		return (
			<div className="nextWordContainer">
				<div className="submittedWordContainer">
					<div  className="nextWord">
						<input type="text" placeholder="what comes next?" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
					</div>
					<button className={this.isReady()} onClick={() => this.submit(this.state.content)}>Submit</button>
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
    	// this.props.showCreation();
    	// this.setState({content: ''})
    }

	render() {
		return (
			<div className="nextWordContainer save">
					<button className="ready" onClick={() => this.submit(this.state.content)}>Save</button>
			</div>
		)
	}
}

export default FrontEnd