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

const Block1 = styled.div`
    background-color:#266DD3;
    height: 100%;
    width: 20%;
`
const Block2 = styled.div`
    background-color:#5C92DE;
    width: 20%;
`
const Block3 = styled.div`
    background-color:#93B6E9;
    width: 20%;
`
const Block4 = styled.div`
    background-color:#C9DBF4;
    width: 20%;
`
const Block5 = styled.div`
    background-color:#FFFFFF;
    width: 20%;
`
const Header2 = styled.div`
    display: flex;
    height:15px;
`

export class Header extends Component {
    render() {
        return (
            <div>
                <StyledHeader>
                    <Title>tempo</Title>
                    {/* <SubTitle>Tiny curated message selected every {this.props.period}</SubTitle> */}
                </StyledHeader>
                {/* <Header2> */}
                {/*     <Block1></Block1> */}
                {/*     <Block2></Block2> */}
                {/*     <Block3></Block3> */}
                {/*     <Block4></Block4> */}
                {/*     <Block5></Block5> */}
                {/* </Header2> */}
            </div>
        )
    }
}