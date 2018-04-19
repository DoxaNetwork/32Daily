 import React, { Component } from 'react'
import { getContract, getCurrentAccount, getAllLinks, getAllPastWords } from './DappFunctions'
import toAscii from './utils/helpers'
import './FrontEnd.css'
import BackableTokenContract from '../build/contracts/BackableToken.json'


const contract = require('truffle-contract')
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
    	return {'word': toAscii(post.link), 'width': post.backing.toNumber()* 30, 'index': post.index}
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
		const publishedWords = this.state.publishedWords.map(word => 
			<div key={word}>
				<PublishedWord  word={word} />
				<img src="right-arrow.svg"/>
			</div>
		);

		const submittedWords = this.state.submittedWords.map(obj =>
			<SubmittedWord key={obj.index} word={obj.word} width={obj.width} index={obj.index} onClick={this.setPendingVote.bind(this)}/>
		);

		return (
			<div>
				<div className="wordStream">
					{publishedWords}
				</div>
				<div className="submittedWords">
					<NextWord onSubmit={this.postLink.bind(this)}/>
					{submittedWords}
					<div className="saveContainer">
						<button className="save ready" onClick={this.updateVotes.bind(this)}>Save</button>
					</div>
				</div>

				<button className="save ready" onClick={this.publish.bind(this)}>Publish</button>

			</div>
		)
	}
}
export default FrontEnd


class SubmittedWord extends Component {

	constructor(props) {
		super(props);
		this.state = { 
			width: this.props.width,
			published: this.props.width >= 180,
		}
	}

	async handleClick() {

		this.props.onClick(this.props.index);

		if (this.state.published) {
			return;
		}

		let newWidth = this.state.width + 30; // currently this = value * 30

		if (newWidth > (300 - 127)) {
			newWidth = 300 - 127;
			this.setState({published: true});
		}

		this.setState({width: newWidth});
	}

	render() {
		return (

			<div className={this.state.published ? "published submittedWordContainer" : "submittedWordContainer"} onClick={this.handleClick.bind(this)}>
				<div className="progressBar" style={{ width: `${this.state.width}px	`}}></div>
				<div className="submittedWord" >
					{this.props.word}
				</div>
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
					<div className="progressBar" style={{ width: '4px'}}></div>
					<div  className="nextWord">
						<input type="text" placeholder="your word" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
					</div>
				</div>
				<button className={this.isReady()} onClick={() => this.submit(this.state.content)}>Submit</button>
			</div>
		)
	}
}