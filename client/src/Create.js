import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import styled from 'styled-components';

import { submitContent } from './actions'
import { Button, Back } from './styledComponents'
import { FaAngleLeft } from "react-icons/fa";


const CreateContainer = styled.div`
    background-color:#fafafa;
    padding: 40px 25%;
    min-height:70vh;

    @media only screen and (max-width: 749px) {
        padding: 40px;
    }
`
const CreateHeader = styled.div`
    border-bottom: 1px solid black;
    font-size: 2em;
`
const FormContainer = styled.div`
    background-color: var(--white);
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
    @media only screen and (max-width: 649px) {
        padding: 40px 10px 20px;
    }
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
        const freqName = this.props.match.path.split("/")[1];
        if (freqName === 'one') {
            this.props.onSubmit(this.state.content, 'freq1');
        }
        event.preventDefault();
        // setTimeout(() => this.props.history.push('/one'),1000);
    }

    render() {
        const tooManyCharacters = this.state.charactersRemaining < 0 ? 'red' : '';

        return (
            <CreateContainer>
                <Back>
                    <NavLink to={"/" + this.props.match.path.split("/")[1] + "/submissions"}><FaAngleLeft/> Back</NavLink>
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
                            pattern=".{1,256}" 
                            title="No longer than 256 characters" 
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

const mapFreqtoDispatchtoProps = () => (
    dispatch => ({
        onSubmit: (text, freq) => dispatch(submitContent(text, freq))
    })
)

export const ContentForm = withRouter(connect(
    null,
    mapFreqtoDispatchtoProps()
)(Create))

// export const ContentForm2 = withRouter(connect(
//     null,
//     mapFreqtoDispatchtoProps('freq2')
// )(Create))
// 
// export const ContentForm3 = withRouter(connect(
//     null,
//     mapFreqtoDispatchtoProps('freq3')
// )(Create))