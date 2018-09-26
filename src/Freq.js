import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components';

import { Button } from './styledComponents'

const Submit = styled.div`
    button {
        border-radius:5px;
    }
`
const SubmittedContainer = styled.div`
    padding: 40px 40px;
    max-width:420px;
    margin-left:auto;
    /*width:42%;*/
    /*background-color:#fafafa;*/
`
const SubmittedOuterContainer = styled.div`
    background-color: #fafafa;
    width: 42%;
`
const Title = styled.div`
    border-bottom: 1px solid var(--secondary);
    padding-bottom: 10px;
    font-size: 2em;
    /*font-weight:700;*/
`
const PublishedContainer = styled.div`
    /*background-color: white;*/
    padding: 40px 40px;
    max-width:580px;
    margin-right:auto;
    /*width:58%;*/
`
const PublishedOuterContainer = styled.div`
    width:58%;
    background-color:white;
`
const FreqContainer = styled.div`
    display: flex;
    justify-content: center;
    min-height:100vh;
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
                    {this.props.timer}
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