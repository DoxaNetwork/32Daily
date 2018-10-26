import React, { Component } from 'react'
import { BrowserRouter, Route, Switch, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { Header } from './Header'
import { User } from './User'
import { FreqSelector } from './FreqSelector.js'
import { Freq } from './Freq.js'
import { PublishedWords1, PublishedWords2, PublishedWords3 } from './Published'
import { SubmittedWords1, SubmittedWords2, SubmittedWords3 } from './Submitted'
import { Timer1, Timer2, Timer3 } from './Timer.js'
import { Notifications } from './Notifications.js'
import { Modals } from './Modals.js'
import { Footer } from './Footer.js'
import './ThirtytwoDaily.css'
import { ContentForm, ContentForm2, ContentForm3  } from './Create.js'
import { TransitionGroup, CSSTransition } from 'react-transition-group'


import {  loadAccount } from './actions'

class DoxaOne extends Component {
    render() {
        return (
            <BrowserRouter>
                <ThirtytwoDaily></ThirtytwoDaily>
            </BrowserRouter>
        )
    }
}

class _ThirtytwoDaily extends Component {

    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(loadAccount());
    }

    render() {
        return (
            <div style={this.props.style}>
                <Header/>
                <FreqSelector/>
                
                <Switch>
                    <Route
                        path={'/one'}
                        render={() => <Freq timer={<Timer1/>} create={<ContentForm/>} submittedWords={<SubmittedWords1/>} publishedWords={<PublishedWords1/>}/>}
                    />
                    <Route
                        path={'/ten'}
                        render={() => <Freq timer={<Timer2/>} create={<ContentForm2/>} submittedWords={<SubmittedWords2/>} publishedWords={<PublishedWords2/>}/>}
                    />
                    <Route
                        path={'/hundred'}
                        render={() => <Freq timer={<Timer3/>} create={<ContentForm3/>} submittedWords={<SubmittedWords3/>} publishedWords={<PublishedWords3/>}/>}
                    />
                    
                    <Route
                        path={'/u/:id'}
                        component={User}
                    />
                </Switch>
            
                <Footer/>
                <Notifications/>
                <Modals/>
            </div>
        )
    }
}

const ThirtytwoDaily = withRouter(connect()(_ThirtytwoDaily))

export default DoxaOne