import React, { Component } from 'react'
import { BrowserRouter, Link, NavLink, Route } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'

import contract from 'truffle-contract'
import DoxaHubContract from '../build/contracts/DoxaHub.json'
import HigherFreqContract from '../build/contracts/HigherFreq.json'
import { getContract, getCurrentAccount, getAllLinks, preLoadHistory, getPreHistory } from './DappFunctions'
import { ByteArrayToString, stringToChunkedArray, dayOfWeek, month } from './utils/helpers'

import { Header } from './Header'
import { User } from './User'
import { PublishedWords, PublishedWords2 } from './Published'
import { SubmittedWords, SubmittedWords2 } from './Submitted'
import { NewContentForm, NewContentForm2 } from './NextWord'

import './ThirtytwoDaily.css'
import { Button } from './styledComponents'
import styled from 'styled-components';

const doxaHubContract = contract(DoxaHubContract)
let doxaHub;
let currentAccount;
let higherFreq;
const higherFreqContract = contract(HigherFreqContract)

function mapPost(post) {
    return {'poster': post.owner, 'word': ByteArrayToString(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
}

class DoxaOne extends Component {
    render() {
        return (
            <BrowserRouter>
                <Route path="/" component={Doxa1}/>
            </BrowserRouter>
        )
    }
}

class Doxa1000 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#16d"}} title="Doxa1000" period="1000 hours"></ThirtytwoDaily>
        )
    }
}

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
    state = {
        owner: false,
    }

    async publish() {
        doxaHub = await getContract(doxaHubContract)
        higherFreq = await getContract(higherFreqContract)
        currentAccount = await getCurrentAccount()
        await doxaHub.publish({from: currentAccount});
        await higherFreq.cycle({from: currentAccount})
    }

    render() {
        const publishButton = (
            <PublishButton>
                <Button onClick={this.publish.bind(this)}>Publish</Button>
            </PublishButton>
            );

        return (
            <div style={this.props.style}>
                {publishButton}
                <Header title={this.props.title} period={this.props.period} showTimerText={true}/>
                <FreqSelector>
                    <NavLink activeClassName="active" className="doxa1link" to="/freq1/">
                        <div>10 minutes</div>
                    </NavLink>
                    <NavLink activeClassName="active" className="doxa1000link" to="/freq2/">
                        <div>100 minutes</div>
                    </NavLink>
                    <div>1,000 minutes</div>
                    <div>10,000 minutes</div>
                    <div>100,000 minutes</div>
                </FreqSelector>
                <Route
                    path={this.props.match.url + 'freq1'}
                    render={(props) => <SubmittedAndPublishedWords/>}
                />
                <Route
                    path={this.props.match.url + 'user/:id'}
                    component={User}
                />
                <Route
                    path={this.props.match.url + 'freq2'}
                    render={(props) => <SubmittedAndPublishedWords2/>}
                />

                <div className="footer">
                </div>
            </div>
        )
    }
}

const FreqSelector = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px 50px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0,0,0,.14);

    div {
        border: 1px solid black;
        border-left: none;
        width: 150px;
        text-align:center;
        padding: 10px 0;
    }
    div:first-child {
        border-left: 1px solid black;
    }

    div:hover {
        background-color:black;
        color: white;
    }
`

const PublishButton = styled.div`
    background-color: var(--white);
    border-bottom: 2px solid var(--lightgray);
    padding: 10px;
    text-align: center;

    button {
        border-radius: var(--border-radius);
    }
`

const ShowSubmissionsLink = styled.div`
    background-color: white;
    padding: 10px;
    width: 25%;
    margin: 20px auto;
    border-radius: var(--border-radius);
    color: var(--gray);
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    cursor: pointer;
    text-align: center;

    &:hover {
        color: white;
        background-color: var(--main-color);
    }
`
// need to redux this one
class SubmittedAndPublishedWords extends Component {

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
        return (
            <div>
                <div className="appContainer">
                    <div className="rightSide">
                        <SubmittedWords/>
                    </div>
                    <div className="rightSide">
                        <PublishedWords/>
                        <NewContentForm/>
                    </div>
                </div>
            </div>
        )
    }
}

class SubmittedAndPublishedWords2 extends Component {

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
        return (
            <div className="appContainer">
                <SubmittedContainer>
                    <SubmittedHeader>
                        Submitted
                    </SubmittedHeader>
                    <SubmittedWords2/>
                </SubmittedContainer>

                <PublishedContainer>
                    <PublishedHeader>
                        Published
                    </PublishedHeader>
                    <PublishedWords2/>
                    <NewContentForm2/>
                </PublishedContainer>
            </div>
        )
    }
}

const SubmittedContainer = styled.div`
    padding: 40px 30px;
    width:42%;
    background-color:#fafafa;
`
const SubmittedHeader = styled.div`
    border-bottom: 1px solid black;
    font-size: 2em;
`
const PublishedContainer = styled.div`
    background-color: white;
    padding: 40px 30px;
    width:58%;
`
const PublishedHeader = styled.div`
    border-bottom: 1px solid black;
    font-size: 2em;
`

export default DoxaOne