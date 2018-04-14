import React, { Component } from 'react'

import './FrontEnd.css'

class FrontEnd extends Component {

	constructor(props){
		super(props);
	}

	render() {
		const publishedWords = this.props.publishedWords.map(word => 
			<div>
				<PublishedWord word={word} />
				<img src="right-arrow.svg"/>
			</div>
		);

		const submittedWords = this.props.submittedWords.map(obj =>
			<SubmittedWord word={obj.word} width={obj.width} />
		);

		return (
			<div>
				<div className="wordStream">
					{publishedWords}
				</div>
				<div className="submittedWords">
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

		let newWidth = this.state.width * 1.5;

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
	}

	render() {
		return (
			<div className="nextWord">
			<input type="text" />
			</div>
		)
	}
}