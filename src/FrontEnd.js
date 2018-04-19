import React, { Component } from 'react'
import { getContract, getCurrentAccount, getAllLinks, getAllPastWords } from './DappFunctions'
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
			'pendingVotes': {}
		}
	}

	async componentWillMount() {
		// initialize global state
		tokenInstance = await getContract(token);
		currentAccount = await getCurrentAccount();


        const posts = await getAllLinks();
        const postObjs = posts.map(postObj => this.mapPost(postObj))

        const publishedWords = await getAllPastWords();
        this.setState({publishedWords, 'submittedWords': postObjs})
    }

    mapPost(post) {
    	return {'word': toAscii(post.link), 'backing': post.backing.toNumber(), 'index': post.index}
    }

    async postLink(content) {
    	const result = await tokenInstance.postLink(content, { from: currentAccount})
        const newPost = this.mapPost(result.logs[0].args);
        this.setState({ submittedWords: [...this.state.submittedWords, newPost] })
    }

    async updateVotes() {
    	const indexes = Object.keys(this.state.pendingVotes);
    	const votes = Object.values(this.state.pendingVotes);

    	const result = await tokenInstance.backPosts(indexes, votes, { from: currentAccount })
    }

    setPendingVote(index) {
    	let pendingVotes = {...this.state.pendingVotes}

    	pendingVotes[index.toNumber()] ? pendingVotes[index.toNumber()] += 1 : pendingVotes[index.toNumber()] = 1;
    	this.setState({pendingVotes});
    }

    async publish() {
    	const result = await tokenInstance.publish({from: currentAccount});
    }

	render() {
		const publishedWords = this.state.publishedWords.map(obj => 
			<div key={obj.content}>
				<PublishedWord  word={obj.content} />
				<span className="blockDate">{obj.date}</span>
				<img src="right-arrow.svg"/>
			</div>
		);

		const submittedWords = this.state.submittedWords.map(obj =>
			<SubmittedWord key={obj.index} word={obj.word} backing={obj.backing} index={obj.index} onClick={this.setPendingVote.bind(this)}/>
		);

		return (
			<div className="appContainer">
				<div className="wordStream">
					{publishedWords}
				</div>
				<div className="wordFactory">
					<div className="submittedWords">
						{submittedWords}
					</div>
					<NextWord onSubmit={this.postLink.bind(this)}/>
					<div className="saveContainer">
						<button className="save ready" onClick={this.updateVotes.bind(this)}>Save</button>
						<button className="save ready" onClick={this.publish.bind(this)}>Publish</button>
					</div>
				</div>

				

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
		const fullWidth = 255;
		const multiplier = fullWidth / maxVotes;

		return votes * multiplier;

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
				<div className="votingBar2" style={{width: `${this.mapVotesToPixels(this.state.backing)}px`}}> </div>
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
			<div className="word">
				{this.props.word}
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

    isReady() {
    	if (this.state.content !== '') {
    		return 'ready';
        }
    }

	render() {
		return (
			<div className="nextWordContainer">
				<div className="submittedWordContainer">
					<div  className="nextWord">
						<input type="text" placeholder="your word" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
					</div>
				</div>
				<button className={this.isReady()} onClick={() => this.submit(this.state.content)}>Submit</button>
			</div>
		)
	}
}

export default FrontEnd