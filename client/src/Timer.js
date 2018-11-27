import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip'
import { loadPublishTime } from './actions'
import pluralize from 'pluralize';


const TimerContainer = styled.div`
    h2,h4 {
        text-align: left;
        margin: 0 auto;
        width:190px;
        color: var(--secondary);
    }
`

function displayMoreThanDay(msec) {
    const days = Math.floor(msec / 1000 / 60 / 60 / 24)
    msec -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(msec / 1000 / 60 / 60);
    msec -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(msec / 1000 / 60);

    return `${pluralize('day', days, true)} ${pluralize('hour', hours, true)}`
}

function displayLessThanDay(msec) {
    const hours = Math.floor(msec / 1000 / 60 / 60);
    msec -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(msec / 1000 / 60);

    return `${pluralize('hour', hours, true)} ${pluralize('min', minutes, true)}`
}

function displayLessThanHour(msec) {
    const minutes = Math.floor(msec / 1000 / 60);
    msec -= minutes * 1000 * 60;

    return `${pluralize('min', minutes, true)}`
}

class Timer extends Component {

    componentDidMount() {
        this.props.refreshTime();
        this.getNewPublishTime = setInterval(() => {
            const endingTime = new Date(this.props.nextPublishTime*1000)
            const now = new Date();
            let msec = endingTime.getTime() - now.getTime();

            if (msec < 0) {
            }
        }, 10000);

        this.updateClockDisplay = setInterval(() => {
            this.forceUpdate()
        }, 5000);
    }

    componentWillUnmount() {
      clearInterval(this.updateClockDisplay);
      clearInterval(this.getNewPublishTime);
    }

    render() {
        const endingTime = new Date(this.props.nextPublishTime*1000)
        const now = new Date();

        let msec = endingTime.getTime() - now.getTime();
        let timeLeft;

        if (this.props.nextPublishTime == 0) {
            timeLeft = "loading..."
        } else if (msec < 0) {
            timeLeft = "publishing now..."
        } else if (msec > 86400000) {
            timeLeft = displayMoreThanDay(msec)
        } else if (msec > 3600000) {
            timeLeft = displayLessThanDay(msec)
        } else if (msec > 60000) {
            timeLeft = displayLessThanHour(msec)
        }


        return (
            <TimerContainer>
                <ReactTooltip className="custom-tooltip" effect="solid"/>
                <h4 data-tip="post with most votes will be published">Next post published in</h4>
                <h2 dangerouslySetInnerHTML={{ __html: timeLeft }}></h2>
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