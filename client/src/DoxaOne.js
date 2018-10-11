import React, { Component } from 'react'
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom'
import styled from 'styled-components';

import { Header } from './Header'
import { User } from './User'
import { FreqSelector } from './FreqSelector.js'
import { ContentForm1, ContentForm2, ContentForm3 } from './Create.js'
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
    display: flex;
    background-color:var(--secondary);
    padding:40px 50px 70px;
    color:var(--white);
` 
const FooterCol = styled.div`
    width:150px;
`
const FooterTitle = styled.h4`
    margin-bottom: 10px;
`
const FooterRow = styled.div`
    a {
       display:block;
       color: var(--lightgray);
       text-decoration: none;
       &:hover {
           color: var(--bright);
       } 
    }   
`
class ThirtytwoDaily extends Component {

    render() {
        return (
            <div style={this.props.style}>
                <Header/>
                <FreqSelector/>
                <Switch>
                    <Route
                        path={'/one'}
                        render={() => <Freq timer={<Timer1/>} submittedWords={<SubmittedWords1/>} publishedWords={<PublishedWords1/>}/>}
                    />
                    <Route
                        path={'/ten'}
                        render={() => <Freq timer={<Timer2/>} submittedWords={<SubmittedWords2/>} publishedWords={<PublishedWords2/>}/>}
                    />
                    <Route
                        path={'/hundred'}
                        render={() => <Freq timer={<Timer3/>} submittedWords={<SubmittedWords3/>} publishedWords={<PublishedWords3/>}/>}
                    />
                    
                    <Route
                        path={'/u/:id'}
                        component={User}
                    />
                </Switch>
                <Footer>
                    <FooterCol>
                        <FooterTitle>
                             About
                        </FooterTitle>
                        <FooterRow><Link to="/faq">FAQ</Link></FooterRow>
                        <FooterRow><a href="https://medium.com/the-doxa-blog">Blog</a></FooterRow>
                    </FooterCol>
                    <FooterCol>
                        <FooterTitle>
                            Contact
                        </FooterTitle>
                        <FooterRow><a href="https://discordapp.com/invite/2Qb9R7p">Discord</a></FooterRow>
                        <FooterRow><a href="mailto:hello@doxa.network">Email us</a></FooterRow>
                    </FooterCol>
                    <FooterCol>
                        <FooterTitle>
                             Company
                        </FooterTitle>
                        <FooterRow><Link to="/team">Team</Link></FooterRow>
                        <FooterRow><a href="mailto:hello@doxa.network">Jobs</a></FooterRow>
                    </FooterCol>
                </Footer>
            </div>
        )
    }
}


export default DoxaOne