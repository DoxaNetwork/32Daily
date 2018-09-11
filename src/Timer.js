import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';


const TimerContainer = styled.div`
    text-align:center;

    h4,h1 {
        margin:0;
    }
`

export class Timer extends Component {
    state = {
        time: new Date(),
        endingTime: new Date()
    }

    componentDidMount() {
        const endingTime = new Date()
        endingTime.setMinutes(endingTime.getMinutes() + 5);
        this.setState({endingTime})
        this.interval = setInterval(() => this.setState({ time: new Date() }), 1000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    render() {
        let msec = this.state.endingTime.getTime() - this.state.time.getTime();
        const hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(msec / 1000 / 60);
        msec -= minutes * 1000 * 60;
        const seconds = Math.floor(msec / 1000);
        msec -= seconds * 1000;


        return (
            <TimerContainer>
                <h4>Next item published in</h4>
                <h1>{minutes} : {('00' + seconds).slice(-2)}</h1>
            </TimerContainer>
            )
    }
}
