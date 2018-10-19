import React, { Component } from 'react'
import { NavLink, Switch, Route, Redirect, withRouter } from 'react-router-dom'
import styled from 'styled-components';
import Media from 'react-media';
import { FaAngleLeft } from "react-icons/fa";

import { ContentForm } from './Create.js'
import { Button, Back } from './styledComponents'


const SubmittedContainer = styled.div`
    padding: 40px 40px;
    max-width:420px;
    margin-left:auto;

    @media only screen and (max-width: 649px) {
        margin:auto;
        max-width:unset;
    }
`
const SubmittedOuterContainer = styled.div`
    background-color: #fafafa;
    width: 42%;

    @media only screen and (max-width: 649px) {
        width:100%;
    }
`
const Title = styled.div`
    border-bottom: 1px solid var(--secondary);
    padding-bottom: 10px;
    font-size: 2em;
`
const PublishedContainer = styled.div`
    padding: 40px 40px;
    max-width:580px;
    margin-right:auto;

    @media only screen and (max-width: 649px) {
        margin:auto;
        max-width:unset;
    }
`
const PublishedOuterContainer = styled.div`
    width:58%;
    background-color:var(--white);

    @media only screen and (max-width: 649px) {
        width:100%;
    }
`
const FreqContainer = styled.div`
    display: flex;
    justify-content: center;
    min-height:100vh;
`

const TimerAndCreate = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-around;
    padding: 20px 0;

    button {
        @media only screen and (max-width: 649px) {
            margin-top: 20px;
        }
    }
`

class Published extends Component {
    render() {
        return (
            <FreqContainer>
                <PublishedOuterContainer>
                    <PublishedContainer>
                        <Back><NavLink to={this.props.match.path + "/submissions"}><FaAngleLeft/> New</NavLink></Back>
                        <Title>
                            Top
                        </Title>
                        {this.props.publishedWords}
                    </PublishedContainer>
                </PublishedOuterContainer>
            </FreqContainer>
            )
    }
}

class Submissions extends Component {
    render() {
        return (
            <FreqContainer>
                <SubmittedOuterContainer>
                    <SubmittedContainer>
                        <Back><NavLink to={this.props.match.url + "/published"}><FaAngleLeft/> Top</NavLink></Back>
                        <Title>
                            New
                        </Title>
                        <TimerAndCreate>
                            {this.props.timer}
                            <NavLink activeClassName="navLink-active" to={`${this.props.match.path}/create`}>
                                <Button>Create Post</Button>
                            </NavLink>
                        </TimerAndCreate>
                        {this.props.submittedWords}
                    </SubmittedContainer>
                </SubmittedOuterContainer>
            </FreqContainer>
            )
    }
}

class SubmissionsAndPublished extends Component {
    render() {
        return (
             <FreqContainer>
            <SubmittedOuterContainer>
                <SubmittedContainer>
                    <Title>
                        New
                    </Title>
                    <TimerAndCreate>
                        {this.props.timer}
                        <NavLink activeClassName="navLink-active" to={`${this.props.match.path}/create`}>
                            <Button>Create Post</Button>
                        </NavLink>
                    </TimerAndCreate>
                    {this.props.submittedWords}
                </SubmittedContainer>
            </SubmittedOuterContainer>

            <PublishedOuterContainer>
                <PublishedContainer>
                    <Title>
                        Top
                    </Title>
                    {this.props.publishedWords}
                </PublishedContainer>
            </PublishedOuterContainer>
             </FreqContainer>
            )
    }
}

class _Freq extends Component {
    render() {
        return (
                <Media query="(max-width: 649px)">
                    {matches =>
                        matches ? (
                            <Switch>
                                <Redirect exact from={this.props.match.path} to={this.props.match.path + "/published"}/>
                                <Route exact path={this.props.match.path + "/published"} render={() => <Published {...this.props}/>}/>
                                <Route exact path={this.props.match.path + "/create"} render={() => <div>{this.props.create}</div>}/>
                                <Route exact path={this.props.match.path +  "/submissions"} render={() => <Submissions {...this.props}/>} />
                            </Switch>
                        ) : (
                            <Switch>
                                <Redirect from={this.props.match.path + "/submissions"} to={this.props.match.path}/>
                                <Redirect from={this.props.match.path + "/published"} to={this.props.match.path}/>
                                <Route exact path={this.props.match.path} render={() => <SubmissionsAndPublished {...this.props}/>}/> 
                                {/* <Route exact path={this.props.match.path + '/create'} component={ContentForm}/> */}
                                <Route exact path={this.props.match.path + "/create"} render={() => <div>{this.props.create}</div>}/>
                            </Switch>
                        )
                    }
                </Media>
        )
    }
}

export const Freq = withRouter(_Freq);