import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import styled from 'styled-components';

import { Header } from './Header'
import { User } from './User'
import { FreqSelector } from './FreqSelector.js'
import { ContentForm } from './Create.js'
import { Freq } from './Freq.js'
import { PublishedWords1, PublishedWords2, PublishedWords3, PublishedWords4, PublishedWords5 } from './Published'
import { SubmittedWords1, SubmittedWords2, SubmittedWords3, SubmittedWords4, SubmittedWords5 } from './Submitted'
import { Timer1, Timer2, Timer3, Timer4, Timer5 } from './Timer.js'

import './ThirtytwoDaily.css'

class DoxaOne extends Component {
    render() {
        return (
            <BrowserRouter>
                <ThirtytwoDaily></ThirtytwoDaily>
            </BrowserRouter>
        )
    }
}

const Footer = styled.div`
    height:150px;
    box-sizing: border-box;
    background-color:var(--secondary);
    text-align:center;
    padding-top:70px;
    color:lightgray;
` 
class ThirtytwoDaily extends Component {

    render() {
        return (
            <div style={this.props.style}>
                <Header/>
                <FreqSelector/>
                <Route
                    exact path={'/freq1'}
                    render={(props) => <Freq submit={true} timer={<Timer1/>} submittedWords={<SubmittedWords1/>} publishedWords={<PublishedWords1/>}/>}
                />
                <Route
                    exact path={'/freq2'}
                    render={(props) => <Freq timer={<Timer2/>} submittedWords={<SubmittedWords2/>} publishedWords={<PublishedWords2/>}/>}
                />
                <Route
                    exact path={'/freq3'}
                    render={(props) => <Freq timer={<Timer3/>} submittedWords={<SubmittedWords3/>} publishedWords={<PublishedWords3/>}/>}
                />
                <Route
                    exact path={'/freq4'}
                    render={(props) => <Freq timer={<Timer4/>} submittedWords={<SubmittedWords4/>} publishedWords={<PublishedWords4/>}/>}
                />
                <Route
                    exact path={'/freq5'}
                    render={(props) => <Freq timer={<Timer5/>} submittedWords={<SubmittedWords5/>} publishedWords={<PublishedWords5/>}/>}
                />
                <Route
                    exact path={'/freq1/create'}
                    render={ContentForm}
                />
                <Route
                    path={'/u/:id'}
                    component={User}
                />
                <Footer>
                    Copyright Doxa
                </Footer>
            </div>
        )
    }
}


export default DoxaOne