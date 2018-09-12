import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components';

import { Button } from './styledComponents'

const TimerAndSubmit = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 20px 20px;
`
const Submit = styled.div`
    button {
        border-radius:5px;
    }
`
const SubmittedContainer = styled.div`
    padding: 40px 30px;
    width:42%;
    background-color:#fafafa;
`
const Title = styled.div`
    border-bottom: 1px solid black;
    font-size: 2em;
`
const PublishedContainer = styled.div`
    background-color: white;
    padding: 40px 30px;
    width:58%;
`

export class Freq extends Component {
    render() {
        const submit = this.props.submit ? (
            <Submit>
                <NavLink to="/freq1/create">
                <Button>Create Post</Button>
                </NavLink>
            </Submit>
        ) : '';

        return (
            <div className="appContainer">
                <SubmittedContainer>
                    <Title>
                        Submitted
                    </Title>
                    <TimerAndSubmit>
                        {this.props.timer}
                        {submit}
                    </TimerAndSubmit>
                    {this.props.submittedWords}
                </SubmittedContainer>

                <PublishedContainer>
                    <Title>
                        Published
                    </Title>
                    {this.props.publishedWords}
                </PublishedContainer>
            </div>
        )
    }
}