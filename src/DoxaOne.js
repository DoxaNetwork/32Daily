import React, { Component } from 'react'
import { BrowserRouter, Link, NavLink, Route } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'

import contract from 'truffle-contract'
import DoxaHubContract from '../build/contracts/DoxaHub.json'
import { getContract, getCurrentAccount, getAllLinks, preLoadHistory, getPreHistory } from './DappFunctions'
import { ByteArrayToString, stringToChunkedArray, dayOfWeek, month } from './utils/helpers'

import { Header } from './Header'
import { UserRedux } from './User'
import { PublishedWordsRedux } from './Published'
import { SubmittedWordsRedux } from './Submitted'
import { NextWordRedux } from './NextWord'

import './ThirtytwoDaily.css'

const doxaHubContract = contract(DoxaHubContract)
let doxaHub;
let currentAccount;

function mapPost(post) {
    return {'poster': post.owner, 'word': ByteArrayToString(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
}

class DoxaOne extends Component {
    render() {
        return (
                <BrowserRouter>
                    <div>
                        <nav className="navbar">
                            <NavLink activeClassName="active" className="doxa1link" to="/1">Doxa1 </NavLink>
                            <NavLink activeClassName="active" className="doxa10link" to="/10">Doxa10 </NavLink>
                            <NavLink activeClassName="active" className="doxa100link" to="/100">Doxa100 </NavLink>
                            <NavLink  activeClassName="active" className="doxa1000link" to="/1000">Doxa1000 </NavLink>
                        </nav>
                        <Route path="/1" component={Doxa1}/>
                        <Route path="/10" component={Doxa10}/>
                        <Route path="/100" component={Doxa100}/>
                        <Route path="/1000" component={Doxa1000}/>
                    </div>
                </BrowserRouter>
        )
    }
}
/*
            */

class Doxa1000 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#16d"}} title="Doxa1000" period="1000 hours"></ThirtytwoDaily>
        )
    }
}
// 10 minutes
// 100 minutes 1.5 hours
// 1000 minutes 17 hours
// 10000 minutes 6.9 days

class Doxa100 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#0b8"}} title="Doxa100" period="100 hours"></ThirtytwoDaily>
        )
    }
}

class Doxa10 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#f80"}} title="Doxa10" period="10 hours"></ThirtytwoDaily>
        )
    }
}

class Doxa1 extends Component {
    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#d04"}} title="Doxa1" period="hour"></ThirtytwoDaily>
        )
    }
}

class ThirtytwoDaily extends Component {

    constructor(props){
        super(props);
        this.state = {
            'showSubmissions': false,
            owner: false,
        }
    }

    async publish() {
        await doxaHub.publish({from: currentAccount});
    }

    toggleSubmissionView() {
        this.setState({showSubmissions: !this.state.showSubmissions})
    }

    render() {
        const publishButton = (
            <div className="publishButton">
                <button onClick={this.publish.bind(this)}>Publish</button>
            </div>
            );

        return (
            <div style={this.props.style}>
                {publishButton}
                <Header title={this.props.title} period={this.props.period} showTimerText={this.state.showSubmissions}/>
                <Route
                    exact path={this.props.match.url}
                    render={(props) => <SubmittedAndPublishedWords showSubmissions={this.state.showSubmissions} toggleSubmissionView={this.toggleSubmissionView.bind(this)} />}
                />
                <Route
                    path={this.props.match.url + '/:id'}
                    component={UserRedux}
                />

                <div className="footer">
                </div>
            </div>
        )
    }
}

// need to redux this one
class SubmittedAndPublishedWords extends Component {

    constructor(props) {
        super(props)
         this.state = {
            owner: false,
        }
    }

    async componentWillMount() {
        doxaHub = await getContract(doxaHubContract);
        currentAccount = await getCurrentAccount();
        const owner = await doxaHub.owner();
        this.setState({
            owner: owner === currentAccount,
        })
    }

    mapPost(post) {
        return {'poster': post.owner, 'word': ByteArrayToString(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
    }

    getEventsByType(events, type) {
        let matchedEvents = []
        for (let i = 0; i < events.length; i++) {
            if (events[i].event === type) {
                matchedEvents.push(events[i])
            }
        }
        return matchedEvents;
    }

    render() {
        const submissionLink = this.props.showSubmissions ? 'Hide current submissions' : 'Show current submissions';

        const submittedWordsBlock = this.props.showSubmissions ? (
            <div className="rightSide">
                <SubmittedWordsRedux/>
            </div>
            ) : ('');

        const hidden = this.props.showSubmissions ? 'hidden' : '';

        return (
            <div>
                <div className="appContainer">
                    {submittedWordsBlock}
                    <div className={`rightSide ${hidden}`}>
                        <PublishedWordsRedux/>
                        <NextWordRedux/>
                    </div>
                </div>
                <div className="showSubmissions link" onClick={this.props.toggleSubmissionView.bind(this)}>{submissionLink}</div>
            </div>
        )
    }
}

export default DoxaOne