import React, { Component } from 'react'
import { getAllLinks, postLink } from './DappFunctions'

import './FrontEnd.css'

class FrontEnd extends Component {

	constructor(props){
		super(props);
		this.state = {'submittedWords': []}
	}

	async componentWillMount() {
        const posts = await getAllLinks();
        const postObjs = posts.map(postObj => this.mapPost(postObj))
        this.setState({'submittedWords': postObjs})
    }

    mapPost(post) {
    	return {'word': post.link, 'width': post.backing.toNumber()}
    }

    async postLink(content) {
        const result = await postLink(content);
        const newPost = this.mapPost(result.logs[0].args);
        this.setState({ submittedWords: [...this.state.submittedWords, newPost] })
    }

	render() {
		const publishedWords = this.props.publishedWords.map(word => 
			<div>
				<PublishedWord word={word} />
				<img src="right-arrow.svg"/>
			</div>
		);

		const submittedWords = this.state.submittedWords.map(obj =>
			<SubmittedWord word={obj.word} width={obj.width} />
		);

		return (
			<div>
				<div className="wordStream">
					{publishedWords}
				</div>
				<div className="submittedWords">
					<NextWord onSubmit={this.postLink.bind(this)}/>
					{submittedWords}
					
				</div>

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
			published: false,
		}
	}

	handleClick() {
		if (this.state.published) {
			return;
		}

		let newWidth = this.state.width + 30;

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