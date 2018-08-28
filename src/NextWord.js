import React, { Component } from 'react'
import { connect } from 'react-redux'

import { submitContent } from './actions'
import { Button, Input } from './styledComponents'

import styled from 'styled-components';

const CountedTextInput = styled.div`
    color: black;
    background-color: var(--white);
    height: 50px;
    line-height: 50px;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    transition: all 200ms ease-in-out;
    padding: 0 5px 0 15px;
`
const CountedTextForm = styled.form`
    display: flex;
    justify-content: space-between;
    margin: 20px 5px 10px;
    height: 50px;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
`

const TextInputCount = styled.span`
    color: var(--gray);
    padding: 0 10px;
`

const Container = styled.div`
     margin-top: 40px;
`

class LimitedTextForm extends Component {
    maxCharacters = 160;
    state = {
        content: '',
        charactersRemaining: this.maxCharacters
    }

    handleContentChange(event) {
        const charactersRemaining = this.maxCharacters - event.target.value.length;
        this.setState({content: event.target.value, charactersRemaining})
    }

    submit(event) {
        this.props.onSubmit(this.state.content);
        this.setState({content: '', charactersRemaining: this.maxCharacters})
        event.preventDefault();
    }

    render() {
        const tooManyCharacters = this.state.charactersRemaining < 0 ? 'red' : '';
        const unsavedState = this.state.charactersRemaining < this.maxCharacters ? 'unsaved' : '';

        return (
            <Container>
                <div className="sectionTitle">What's happening today?</div>
                <CountedTextForm onSubmit={this.submit.bind(this)}>
                    <CountedTextInput  className="nextWord">
                        <Input autoComplete="off" required pattern=".{1,160}" title="No longer than 160 characters" type="text" placeholder="Write today's headline" name="content" value={this.state.content} onChange={this.handleContentChange.bind(this)}/>
                        <TextInputCount className={`${tooManyCharacters}`}>{this.state.charactersRemaining}</TextInputCount>
                    </CountedTextInput>
                    <Button className={`${unsavedState}`}type="submit">Submit</Button>
                </CountedTextForm>
            </Container>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    onSubmit: text => dispatch(submitContent(text))
})

export const NewContentForm = connect(
    null,
    mapDispatchToProps
)(LimitedTextForm)