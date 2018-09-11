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
    font-size:56pt;
    padding: 120px 0;
    /*background: linear-gradient(to bottom right, #000033 , #880033);*/
    background: linear-gradient(to bottom right, #000033 , var(--main-color));
    /*background: linear-gradient(to bottom right, var(--main-color) , #880033);*/
    /*background-color: var(--main-color);*/
    /*border-bottom: 4px solid var(--main-color);*/
    margin:auto;
    text-align: center;
`

export class Header extends Component {
    state = {
        time: new Date()
    }
    
    componentDidMount() {
      this.interval = setInterval(() => this.setState({ time: new Date() }), 1000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    render() {
        const hoursRemaining = 23 - this.state.time.getUTCHours();
        const minutesRemaining = 59 - this.state.time.getUTCMinutes();
        const timeConsumedPercent = (this.state.time.getUTCHours() * 60 + this.state.time.getUTCMinutes()) / (24 * 60) * 100;

        return (
            <div>
                <StyledHeader>
                    <Title>{this.props.title}</Title>
                    <SubTitle>Tiny curated message selected every {this.props.period}</SubTitle>
                </StyledHeader>
            </div>
        )
    }
}