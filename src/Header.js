import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'


export class Header extends Component {
    constructor(props) {
        super(props)
        this.state = {
            time: new Date()
        }
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
                <div className="timerText">{hoursRemaining} hours and {minutesRemaining} minutes remaining</div> 
            ) : '';

        return (
            <div>
                <div className="header">
                    <div className="title">{this.props.title}</div>
                    <div className="subtitle">Tiny curated message selected every {this.props.period}</div>
                </div>
                <CSSTransitionGroup
                    transitionName="timeBar"
                    transitionAppear={true}
                    transitionAppearTimeout={400}
                    transitionEnter={false}
                    transitionLeave={false}>
                    <div className="timeBar" style={{width: `${timeConsumedPercent}%`}}></div>
                </CSSTransitionGroup>
                {timerText}
            </div>
        )
    }
}