import React, { Component } from 'react'
import { connect } from 'react-redux'
import { submitContent } from './redux'


class NextWord extends Component {

    constructor(props) {
        super(props);
        this.maxCharacters = 160;
        this.state = {
            content: '',
            charactersRemaining: this.maxCharacters
        }
    }

    handleContentChange(event) {
        const charactersRemaining = this.maxCharacters - event.target.value.length;
        this.setState({content: event.target.value, charactersRemaining})
    }

    submit(event) {
        // this now comes directly from redux
        this.props.onSubmit(this.state.content);
        this.setState({content: '', charactersRemaining: this.maxCharacters})
        event.preventDefault();
    }

    render() {
        const tooManyCharacters = this.state.charactersRemaining < 0 ? 'red' : '';
        const unsavedState = this.state.charactersRemaining < this.maxCharacters ? 'unsaved' : '';

        return (
            <div className="nextWordBlock">
                <div className="sectionTitle">What's happening today?</div>
                <form onSubmit={this.submit.bind(this)} className="nextWordContainer">
                    <div  className="nextWord">
                        <input autoComplete="off" required pattern=".{1,160}" title="No longer than 160 characters" type="text" placeholder="Write today's headline" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
                        <span className={`characterCount ${tooManyCharacters}`}>{this.state.charactersRemaining}</span>
                    </div>
                    <button className={`${unsavedState}`}type="submit">Submit</button>
                </form>
            </div>
        )
    }
}

const mapDispatchToProps2 = dispatch => ({
    onSubmit: value => dispatch(submitContent(value))
})

export const NextWordRedux = connect(
    null,
    mapDispatchToProps2
)(NextWord)