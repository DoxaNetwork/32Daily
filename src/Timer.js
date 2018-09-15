import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';
import { loadPublishTime } from './actions'

const TimerContainer = styled.div`
    text-align:center;
    padding: 20px 20px

    h4,h1 {
        margin:0;
    }
`

class Timer extends Component {
    state = {
        time: new Date(),
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            const endingTime = new Date(this.props.nextPublishTime*1000)
            let msec = endingTime.getTime() - this.state.time.getTime();

            if (msec < 0) {
                this.props.refreshTime();
            } else {
                this.setState({ time: new Date() });
            }
        }, 1000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    render() {
        const endingTime = new Date(this.props.nextPublishTime*1000)


        let msec = endingTime.getTime() - this.state.time.getTime();
        if (msec < 0) {
            msec = 0;
        }
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

const mapFreqtoMapStateToProps = freq => (
    state => ({
        nextPublishTime: state[freq].nextPublishTime
    })
)
const mapFreqtoMapDispatchToProps = freq => (
    dispatch => ({
        refreshTime: () => dispatch(loadPublishTime(freq))
    })
)

export const Timer1 = connect(
    mapFreqtoMapStateToProps('freq1'),
    mapFreqtoMapDispatchToProps('freq1')
)(Timer)

export const Timer2 = connect(
    mapFreqtoMapStateToProps('freq2'),
    mapFreqtoMapDispatchToProps('freq2')
)(Timer)

export const Timer3 = connect(
    mapFreqtoMapStateToProps('freq3'),
    mapFreqtoMapDispatchToProps('freq3')
)(Timer)

export const Timer4 = connect(
    mapFreqtoMapStateToProps('freq4'),
    mapFreqtoMapDispatchToProps('freq4')
)(Timer)

export const Timer5 = connect(
    mapFreqtoMapStateToProps('freq5'),
    mapFreqtoMapDispatchToProps('freq5')
)(Timer)