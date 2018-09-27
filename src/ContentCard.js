import React, { Component } from 'react'
import styled from 'styled-components';
import { Link } from 'react-router-dom'
import identicon from 'identicon.js'

const ContentContainer = styled.div`
    background-color:white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    margin-top: 30px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
`
const ContentHeader = styled.div`
    display:flex;
    justify-content: space-between;
    padding: 20px 20px 10px;
`
const ContentBody = styled.div`
    padding: 15px 20px 30px;
    font-family: Open sans;
    /*font-size: 14px;*/
    font-size: ${props => props.fontsize ? props.fontsize : "14"}px;
`
const ContentFooter = styled.div`
    display:flex;
    justify-content: space-between;
    border-top: 1px solid var(--lightgray);
    padding: 10px 20px;
`
const LinkToUser = styled(Link)`
    color: black;
    text-decoration: none;
    float: right;
    padding: 0 10px;
    font-weight: 700;

    &:hover {
        text-decoration: underline;
        color: var(--bright);
    }
`
const VoteLink = styled.div`
    font-weight: 700;
    color:var(--primary);
    transition: color 200ms ease-in-out;
    &:hover {
        cursor: pointer;
        color: var(--bright);
    }
`
const VoteCount = styled.div`
    font-weight:700;
    color: var(--primary);
`

const Identity = styled.img`
    width:25px;
    height:25px;
    border-radius:25px;
`

const UserContainer = styled.div`
    display: flex;
    align-items: center;
`

class Identicon extends Component {
    options = {
      // foreground: [0, 0, 0, 255],               // rgba black
      // background: [255, 255, 255, 255],         // rgba white
      margin: 0.2,                              // 20% margin
      size: 420,                                // 420px square
      format: 'png'                             // could use SVG instead of PNG
    };

    render() {
        const data = new identicon(this.props.poster, this.options);
        const src = "data:image/png;base64," + data.toString();
        return (
            <Identity width="25" height="25" src={src}/>
        )
    }
}

function displayDate(then) {
    const dateOptions = {month: 'short', day: 'numeric'};
    return then.toLocaleDateString('en-US', dateOptions)
}

function displayHour(then) {
    const now = new Date();
    const msec = now.getTime() - then.getTime();
    const hours = Math.floor(msec / 1000 / 60 / 60);
    return `${hours}h`;
}

function displayMins(then) {
    const now = new Date();
    let msec = now.getTime() - then.getTime();
    const hours = Math.floor(msec / 1000 / 60 / 60);
    msec -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(msec / 1000 / 60);
    return `${minutes}m`;
}

function displayPublishDate(then) {
    let dateDisplay;
    let msec = new Date() - then;
    if (msec > 86400000) {
        dateDisplay = displayDate(then)
    } else if (msec > 3600000) {
        dateDisplay = displayHour(then)
    } else {
        dateDisplay = displayMins(then)
    }
    return dateDisplay;
}

export class ContentCard extends Component {
    dateOptions = {month: 'short', day: 'numeric'};

    render() {
        const publishDate = this.props.date ? displayPublishDate(this.props.date) : '';
        const voteLink = this.props.onClick ? <VoteLink onClick={() => this.props.onClick(this.props.index)}>+ Vote</VoteLink> : <div></div>;
        return (
            <ContentContainer>
                <ContentHeader>
                    <UserContainer>
                        <Identicon poster={this.props.poster}/>
                        <LinkToUser to={'/u/' + this.props.poster}>{this.props.poster.substring(0,6)}</LinkToUser>
                    </UserContainer>
                    <div>{publishDate}</div>
                </ContentHeader>
                <ContentBody fontsize={this.props.fontsize}>
                    {this.props.word}
                </ContentBody>
                <ContentFooter>
                    {voteLink}
                    <VoteCount>{this.props.backing + 1}</VoteCount>
                </ContentFooter>
            </ContentContainer>
        )
    }
}

