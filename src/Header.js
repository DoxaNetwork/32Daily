import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'

import styled from 'styled-components';

const Title = styled.div`
    font-family: 'Fredericka the Great', serif;
`

const SubTitle = styled.div`
    margin-top: 20px;
    font-size: 0.3em;
`

const StyledHeader = styled.div`
    color: var(--main-color);
    font-size:56pt;
    padding-bottom: 30px;
    padding-top:30px;
    background-color: var(--white);
    border-bottom: 4px solid var(--main-color);
    margin:auto;
    text-align: center;
`

const TimeBar = styled.div`
    margin-top: -5px;
    height: 2px;
    border-bottom: 3px solid var(--darkwhite);
    background-color: lightgray;
    border-top: 2px solid white;
    transition: width 1200ms ease-out;
`

const TimerText = styled.div`
    color: var(--main-color);
    text-align: right;
    padding: 3px 15px;
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    margin-top: -30px;
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

        const timerText = this.props.showTimerText ? (
            <TimerText>{hoursRemaining} hours and {minutesRemaining} minutes remaining</TimerText> 
        ) : '';

        return (
            <div>
                <StyledHeader>
                    <Title>{this.props.title}</Title>
                    <SubTitle>Tiny curated message selected every {this.props.period}</SubTitle>
                </StyledHeader>
                <CSSTransitionGroup
                    transitionName="timeBar"
                    transitionAppear={true}
                    transitionAppearTimeout={400}
                    transitionEnter={false}
                    transitionLeave={false}>
                    <TimeBar style={{width: `${timeConsumedPercent}%`}}></TimeBar>
                </CSSTransitionGroup>
                {timerText}
            </div>
        )
    }
}