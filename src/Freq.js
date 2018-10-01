import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components';

import { Button } from './styledComponents'

const SubmittedContainer = styled.div`
    padding: 40px 40px;
    max-width:420px;
    margin-left:auto;
`
const SubmittedOuterContainer = styled.div`
    background-color: #fafafa;
    width: 42%;
`
const Title = styled.div`
    border-bottom: 1px solid var(--secondary);
    padding-bottom: 10px;
    font-size: 2em;
`
const PublishedContainer = styled.div`
    padding: 40px 40px;
    max-width:580px;
    margin-right:auto;
`
const PublishedOuterContainer = styled.div`
    width:58%;
    background-color:var(--white);
`
const FreqContainer = styled.div`
    display: flex;
    justify-content: center;
    min-height:100vh;
`

const TimerAndCreate = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 20px 0;
`

export class Freq extends Component {
    render() {
        return (
            <FreqContainer>
                <SubmittedOuterContainer>
                <SubmittedContainer>
                    <Title>
                        Submitted
                    </Title>
                    <TimerAndCreate>
                        {this.props.timer}
                        <NavLink activeClassName="navLink-active" to={`/${this.props.freq}/create`}>
                            <Button>Create Post</Button>
                        </NavLink>
                    </TimerAndCreate>
                    {this.props.submittedWords}
                </SubmittedContainer>
                </SubmittedOuterContainer>

                <PublishedOuterContainer>
                    <PublishedContainer>
                        <Title>
                            Published
                        </Title>
                        {this.props.publishedWords}
                    </PublishedContainer>
                </PublishedOuterContainer>
            </FreqContainer>
        )
    }
}