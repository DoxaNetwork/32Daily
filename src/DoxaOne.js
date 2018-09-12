import React, { Component } from 'react'
import { BrowserRouter, Link, NavLink, Route, withRouter } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import styled from 'styled-components';
import contract from 'truffle-contract'

import DoxaHubContract from '../build/contracts/DoxaHub.json'
import HigherFreqContract from '../build/contracts/HigherFreq.json'
import { getContract, getCurrentAccount, getAllLinks, preLoadHistory, getPreHistory } from './DappFunctions'
import { ByteArrayToString, stringToChunkedArray, dayOfWeek, month } from './utils/helpers'

import { Header } from './Header'
import { User } from './User'
import { FreqSelector } from './FreqSelector.js'
import { ContentForm } from './Create.js'
import { Freq } from './Freq.js'
import { PublishedWords1, PublishedWords2 } from './Published'
import { SubmittedWords1, SubmittedWords2 } from './Submitted'
import { Timer1, Timer2 } from './Timer.js'

import './ThirtytwoDaily.css'
import { Button } from './styledComponents'

const doxaHubContract = contract(DoxaHubContract)
let doxaHub;
let currentAccount;
let higherFreq;
const higherFreqContract = contract(HigherFreqContract)

class DoxaOne extends Component {
    render() {
        return (
            <BrowserRouter>
                <Route path="/" component={Doxa1000}/>
            </BrowserRouter>
        )
    }
}

class Doxa1000 extends Component {

    render() {
        return (
            <ThirtytwoDaily match={this.props.match} style={{"--main-color": "#16d"}} title="Tempos" period="1000 hours"></ThirtytwoDaily>
        )
    }
}

const PublishButton = styled.div`
    background-color: var(--white);
    border-bottom: 2px solid var(--lightgray);
    padding: 10px;
    text-align: center;

    button {
        border-radius: var(--border-radius);
    }
`

class ThirtytwoDaily extends Component {
    state = {
        owner: false,
    }

    async publish() {
        doxaHub = await getContract(doxaHubContract)
        higherFreq = await getContract(higherFreqContract)
        currentAccount = await getCurrentAccount()
        await doxaHub.publish({from: currentAccount});
        await higherFreq.publish({from: currentAccount})
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
                <FreqSelector/>
                <Route
                    exact
                    path={this.props.match.url + 'freq1'}
                    render={(props) => <Freq submit={true} timer={<Timer1/>} submittedWords={<SubmittedWords1/>} publishedWords={<PublishedWords1/>}/>}
                />
                <Route
                    path={this.props.match.url + 'freq2'}
                    render={(props) => <Freq timer={<Timer2/>} submittedWords={<SubmittedWords2/>} publishedWords={<PublishedWords2/>}/>}
                />
                <Route
                    path={this.props.match.url + 'freq1/create'}
                    render={ContentForm}
                />
                <Route
                    path={this.props.match.url + 'user/:id'}
                    component={User}
                />
                <div className="footer">
                </div>
            </div>
        )
    }
}


export default DoxaOne