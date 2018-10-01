import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'

import styled from 'styled-components';

const Title = styled.div`
    font-family: 'Comfortaa', serif;
`

const SubTitle = styled.div`
    margin-top: 20px;
    font-size: 0.3em;
`

const StyledHeader = styled.div`
    color: var(--white);
    font-size:24px;
    padding: 15px 0 10px;
    /*background: linear-gradient(to bottom right, #000033 , var(--primary));*/
    background-color: var(--primary);
    margin:auto;
    text-align: center;
`

export class Header extends Component {
    render() {
        return (
            <div>
                <StyledHeader>
                    <Title>temporate</Title>
                    {/* <SubTitle>Tiny curated message selected every {this.props.period}</SubTitle> */}
                </StyledHeader>
            </div>
        )
    }
}