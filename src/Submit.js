import React, { Component } from 'react';


class Submit extends Component {

	constructor(props) {
		super(props)

		this.state = {
			content: ''
		}
	}

	handleContentChange(event) {
        this.setState({content: event.target.value})
    }

	render () {

		return (
			<div>
				<h2>Submit a link</h2>

				<form>
					<input type="text" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
				</form>

				<button onClick={() => this.props.onSubmit(this.state.content)}>Submit</button>
			</div>
		)
	}
}

export default Submit