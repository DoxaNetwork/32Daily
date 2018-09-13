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
    width:42%;
    background-color:#fafafa;
`
const Title = styled.div`
    border-bottom: 2px solid black;
    padding-bottom: 10px;
    font-size: 2em;
    font-weight:700;
`
const PublishedContainer = styled.div`
    background-color: white;
    padding: 40px 40px;
    width:58%;
`

export class Freq extends Component {
    render() {
        return (
            <div className="appContainer">
                <SubmittedContainer>
                    <Title>
                        Submitted
                    </Title>
                    {this.props.timer}
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