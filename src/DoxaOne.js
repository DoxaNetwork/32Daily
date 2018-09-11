import React, { Component } from 'react'
import { BrowserRouter, Link, NavLink, Route, withRouter } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'


import contract from 'truffle-contract'
import DoxaHubContract from '../build/contracts/DoxaHub.json'
import HigherFreqContract from '../build/contracts/HigherFreq.json'
import { getContract, getCurrentAccount, getAllLinks, preLoadHistory, getPreHistory } from './DappFunctions'
import { ByteArrayToString, stringToChunkedArray, dayOfWeek, month } from './utils/helpers'

import { Header } from './Header'
import { User } from './User'
import { PublishedWords, PublishedWords2 } from './Published'
import { SubmittedWords, SubmittedWords2 } from './Submitted'
// import { NewContentForm, NewContentForm2 } from './NextWord'

import './ThirtytwoDaily.css'
import { Button, Input } from './styledComponents'
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
                    exact
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
                <Route
                    path={this.props.match.url + 'freq1/create'}
                    render={(props => <NewContentForm/>)}
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
    position: relative;

    div {
        border: 1px solid var(--main-color);
        border-left: none;
        width: 150px;
        text-align:center;
        padding: 10px 0;
        /*color: var(--main-color)*/
    }
    div:first-child {
        border-left: 1px solid var(--main-color);
    }

    div:hover {
        background-color:var(--main-color);
        color: white;
    }
    a {
        text-decoration: none;
        color:var(--main-color);
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

import {ContentContainer, ContentHeader, ContentBody, ContentFooter } from './ContentCard.js'
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
            <div className="appContainer">
                <SubmittedContainer>
                    <SubmittedHeader>
                        Submitted
                    </SubmittedHeader>
                    <TimerAndSubmit>
                        <Timer/>
                        <Submit>
                            <NavLink to="/freq1/create">
                            <Button>Create Post</Button>
                            </NavLink>
                        </Submit>
                    </TimerAndSubmit>
                    <SubmittedWords/>
                </SubmittedContainer>

                <PublishedContainer>
                    <PublishedHeader>
                        Published
                    </PublishedHeader>
                    <PublishedWords/>
                </PublishedContainer>
            </div>
        )
    }
}




class Create extends Component {
    maxCharacters = 160;
    state = {
        content: '',
        charactersRemaining: this.maxCharacters
    }

    handleContentChange(event) {
        const charactersRemaining = this.maxCharacters - event.target.value.length;
        this.setState({content: event.target.value, charactersRemaining})
    }

    submit(event) {
        this.props.onSubmit(this.state.content);
        // this.setState({content: '', charactersRemaining: this.maxCharacters})
        event.preventDefault();
        setTimeout(() => this.props.history.push('/freq1'),1000);
    }

    render() {
        const tooManyCharacters = this.state.charactersRemaining < 0 ? 'red' : '';
        const unsavedState = this.state.charactersRemaining < this.maxCharacters ? 'unsaved' : '';

        return (
            <CreateContainer>
                <Back>
                    <NavLink to="/freq1">{"< Back"}</NavLink>
                </Back>
                <CreateHeader>
                    Create
                </CreateHeader>
                <FormContainer>
                    
                    <CountedTextForm>
                        <textarea 
                            autoComplete="off" 
                            autoFocus
                            required 
                            pattern=".{1,160}" 
                            title="No longer than 160 characters" 
                            placeholder="What do you want to tell the world?" 
                            name="content" 
                            value={this.state.content} 
                            onChange={this.handleContentChange.bind(this)}/>
                        <TextInputCount className={`${tooManyCharacters}`}>{this.state.charactersRemaining}</TextInputCount>
                    </CountedTextForm>
                    <CreateFooter>
                        <Button onClick={this.submit.bind(this)}>
                            Submit
                        </Button>
                    </CreateFooter>
                </FormContainer>  
            </CreateContainer>
        )
    }
}
import { submitContent } from './actions'
const mapDispatchToProps = dispatch => ({
    onSubmit: text => dispatch(submitContent(text, 'freq1'))
})

export const NewContentForm = withRouter(connect(
    null,
    mapDispatchToProps
)(Create))

const Back = styled.div`
    margin-bottom:20px;
    font-size:1.2em;
    a {
        color: var(--main-color);
        text-decoration: none;
    }

    
`
const CreateContainer = styled.div`
    background-color:#fafafa;
    padding: 20px 25%;
    min-height:100vh;
`
const CreateHeader = styled.div`
    border-bottom: 1px solid black;
    font-size: 2em;
`
const FormContainer = styled.div`
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    margin-top: 40px;
`
const TextInputCount = styled.span`
    color: var(--gray);
    padding: 0 20px;
`
const CountedTextForm = styled.form`
    padding: 40px 40px 20px;
    textarea {
        padding:20px;
        font-size:1.2em;
        resize:none;
        border:none;
        width:calc(100% - 45px);
        height:100px;
        max-width:500px;
    }
`
const CreateFooter = styled.div`
    text-align: center;
    padding: 20px;
    border-top: 1px solid gray;

    button {
        border-radius: 5px;
    }
`
class Timer extends Component {
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
const TimerContainer = styled.div`
    text-align:center;

    h4,h1 {
        margin:0;
    }
`

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
                    <TimerAndSubmit>
                        <Timer/>
                    </TimerAndSubmit>
                    <SubmittedWords2/>
                </SubmittedContainer>

                <PublishedContainer>
                    <PublishedHeader>
                        Published
                    </PublishedHeader>
                    <PublishedWords2/>
                </PublishedContainer>
            </div>
        )
    }
}

const TimerAndSubmit = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 20px 20px;
`
const Submit = styled.div`
    button {
        border-radius:5px;
    }
`

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