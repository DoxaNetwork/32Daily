import React, { Component } from 'react'

import './FrontEnd.css'

class FrontEnd extends Component {

	constructor(props){
		super(props);
		console.log(props.publishedWords)
	}

	render() {
		const publishedWords = this.props.publishedWords.map(word => 
			<div>
			<PublishedWord word={word} />
			<img src="right-arrow.svg"/>
			</div>
		);

		return (
			<div className="wordStream">
				{publishedWords}
				<div>
					<NextWord />
				</div>
			</div>
		)
	}
}
export default FrontEnd


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