import React, { Component } from 'react';

class PostVoteItem extends Component {
    constructor(props) {
        super(props)

		this.state = {
			value: 0
		}
	}

	handleBackingChange(event) {
        this.setState({value: event.target.value})
    }

    render() {
        return (
            <li>
                <div>
                    {this.props.post.backing.toNumber()} - {this.props.post.link} ----- Vote: 
                    <input style={{width: '100px', textAlign: 'center'}} type="text" name="backing" value={this.state.value} onChange={this.handleBackingChange.bind(this)}/>
                    <button onClick={() => this.props.onSubmit(this.props.post.index, this.state.value)}>Submit</button>
                </div>
            </li>
        )
    }
}

export default PostVoteItem
