import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';
import { loadPublishTime } from './actions'

const TimerContainer = styled.div`
    h2,h4 {
        text-align: left;
        margin: 0 auto;
        width:190px;
        color: var(--secondary);
    }
`

class Timer extends Component {

    componentDidMount() {
        this.getNewPublishTimeInterval = setInterval(() => {
            const endingTime = new Date(this.props.nextPublishTime*1000)
            const now = new Date();
            let msec = endingTime.getTime() - now.getTime();

            if (msec < 0) {
                this.props.refreshTime();
            }
        }, 10000);

        this.updateClockDisplay = setInterval(() => {
            this.forceUpdate()
        }, 1000);
    }

    componentWillUnmount() {
      clearInterval(this.updateClockDisplay);
      clearInterval(this.getNewPublishTimeInterval);
    }

    render() {
        const endingTime = new Date(this.props.nextPublishTime*1000)
        const now = new Date();

        let msec = endingTime.getTime() - now.getTime();
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
                <h4>New post published in</h4>
                <h2>{('00' + hours).slice(-2)} : {('00' + minutes).slice(-2)} : {('00' + seconds).slice(-2)}</h2>
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