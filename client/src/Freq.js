import React, { Component } from 'react'
import { NavLink, Switch, Route, Redirect, withRouter } from 'react-router-dom'
import styled from 'styled-components';
import Media from 'react-media';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button, Back } from './styledComponents'


const SubmittedContainer = styled.div`
    padding: 40px 40px;
    margin:auto;

    a {
        justify-content: flex-end;
    }
`
const SubmittedOuterContainer = styled.div`
    width: 70%;

    @media only screen and (max-width: 649px) {
        width:100%;
    }
`
const Title = styled.div`
    border-bottom: 2px solid var(--secondary);
    padding-bottom: 10px;
    font-size: 2em;
    font-weight: 800;
    color: var(--secondary);
`
const PublishedContainer = styled.div`
    padding: 40px 40px;
    margin:auto;
`
const PublishedOuterContainer = styled.div`
    width:70%;

    @media only screen and (max-width: 649px) {
        width:100%;
    }
`
const FreqContainer = styled.div`
    display: flex;
    justify-content: center;
    min-height:100vh;
    background-color: #fafafa;
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
                        <Back><NavLink to={this.props.match.path + "/submissions"}><FaChevronLeft/> New</NavLink></Back>
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
                        <Back><NavLink to={this.props.match.url + "/published"}>Top <FaChevronRight/> </NavLink></Back>
                        <Title>
                            New
                        </Title>
                        <TimerAndCreate>
                            {this.props.timer}
                            <NavLink activeClassName="navLink-active" to={`${this.props.match.path}/create`}>
                                <Button>New post</Button>
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
                            <Button>New post</Button>
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
                <Media query="(max-width: 1400px)">
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
                                <Route exact path={this.props.match.path + "/create"} render={() => <div>{this.props.create}</div>}/>
                            </Switch>
                        )
                    }
                </Media>
        )
    }
}

export const Freq = withRouter(_Freq);