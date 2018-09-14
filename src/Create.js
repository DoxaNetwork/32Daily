import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import styled from 'styled-components';

import { submitContent } from './actions'
import { Button } from './styledComponents'


const Back = styled.div`
    margin-bottom:20px;
    font-size:1.2em;
    a {
        color: var(--primary);
        text-decoration: none;
    }
`
const CreateContainer = styled.div`
    background-color:#fafafa;
    padding: 20px 25%;
    min-height:100vh;
`
const CreateHeader = styled.div`
    border-bottom: 1px solid black;
    font-size: 2em;
`
const FormContainer = styled.div`
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    margin-top: 40px;
`
const TextInputCount = styled.span`
    color: var(--gray);
    padding: 0 20px;
`
const CountedTextForm = styled.form`
    padding: 40px 40px 20px;
    textarea {
        outline: none;
        padding:20px;
        font-size:1.2em;
        resize:none;
        border:none;
        width:calc(100% - 45px);
        height:160px;
        max-width:500px;
    }
`
const CreateFooter = styled.div`
    text-align: center;
    padding: 20px;
    border-top: 1px solid gray;

    button {
        border-radius: 5px;
        &:hover {
            background-color:var(--bright);
            border-color:var(--bright);
        }
    }
`

class Create extends Component {
    maxCharacters = 256;
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
        event.preventDefault();
        setTimeout(() => this.props.history.push('/freq1'),1000);
    }

    render() {
        const tooManyCharacters = this.state.charactersRemaining < 0 ? 'red' : '';
        const unsavedState = this.state.charactersRemaining < this.maxCharacters ? 'unsaved' : '';

        return (
            <CreateContainer>
                <Back>
                    <NavLink to="/freq1">{"◀ Back"}</NavLink>
                </Back>
                <CreateHeader>
                    Create
                </CreateHeader>
                <FormContainer>
                    <CountedTextForm>
                        <textarea 
                            autoComplete="off" 
                            autoFocus
                            required 
                            pattern=".{1,160}" 
                            title="No longer than 160 characters" 
                            placeholder="What do you want to tell the world?" 
                            name="content" 
                            value={this.state.content} 
                            onChange={this.handleContentChange.bind(this)}/>
                        <TextInputCount className={`${tooManyCharacters}`}>{this.state.charactersRemaining}</TextInputCount>
                    </CountedTextForm>
                    <CreateFooter>
                        <Button onClick={this.submit.bind(this)}>
                            Submit
                        </Button>
                    </CreateFooter>
                </FormContainer>  
            </CreateContainer>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    onSubmit: text => dispatch(submitContent(text, 'freq1'))
})

export const ContentForm = withRouter(connect(
    null,
    mapDispatchToProps
)(Create))