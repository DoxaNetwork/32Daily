import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';


const TimerContainer = styled.div`
    text-align:center;

    h4,h1 {
        margin:0;
    }
`

class Timer extends Component {
    state = {
        time: new Date(),
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({ time: new Date() }), 1000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    render() {
        const endingTime = new Date(this.props.nextPublishTime*1000)

        let msec = endingTime.getTime() - this.state.time.getTime();
        const hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(msec / 1000 / 60);
        msec -= minutes * 1000 * 60;
        const seconds = Math.floor(msec / 1000);
        msec -= seconds * 1000;


        return (
            <TimerContainer>
                <h4>Next item published in</h4>
                <h1>{hours} : {minutes} : {('00' + seconds).slice(-2)}</h1>
            </TimerContainer>
            )
    }
}

const mapStateToProps1 = state => ({
    nextPublishTime: state.freq1.nextPublishTime
})
export const Timer1 = connect(
    mapStateToProps1
    )(Timer)

const mapStateToProps2 = state => ({
    nextPublishTime: state.freq2.nextPublishTime
})
export const Timer2 = connect(
    mapStateToProps2
    )(Timer)