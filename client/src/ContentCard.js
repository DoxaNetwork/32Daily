import React, { Component } from 'react'
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import identicon from 'identicon.js'
import { Button, Back } from './styledComponents'
import {  FaChevronUp   as Icon } from "react-icons/fa";

// FaLevelUpAlt

const ContentContainer = styled.div`
    background-color:var(--white);
    border-radius: 5px;
    /*box-shadow: 0 0 10px rgba(0,0,0,.14);*/
    margin-top: 30px;
    /*box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16), 0 0 0 0 rgba(0,0,0,0.12);*/
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);

    &:hover {
        background-color:#f5f8fa;
    }
`
const ContentHeader = styled.div`
    display:flex;
    justify-content: flex-start;
    padding: 20px 20px 10px;
    align-items: center;
`
const ContentBody = styled.div`
    padding: 15px 50px 30px 90px;
    word-wrap: break-word;

    @media only screen and (max-width: 649px) {
        padding: 15px 20px 30px 70px;    
    }

    span {
        font-family: Open sans;
        font-size: ${props => props.fontsize ? props.fontsize : "14"}px;
    }

    a {
        text-decoration: none;
        color: var(--primary);
        &:hover {
            color: var(--bright);
        }
    }
`
const ContentFooter = styled.div`
    display:flex;
    /*justify-content: space-between;*/
    font-size: 0.7em;
    padding: 10px 20px 15px 90px;
    @media only screen and (max-width: 649px) {
        padding: 10px 20px 15px 70px;
    }
`
const LinkToUser = styled(Link)`
    color: black;
    text-decoration: none;
    font-weight: 700;
    display: flex;
    align-items: center;

    &:hover {
        text-decoration: underline;
        color: var(--bright);
    }
`
const VoteLink = styled(Button)`
    width: unset;
    height: unset;
    padding: 5px 10px;
    color: var(--primary);
    background-color:inherit;
    margin: 0 10px 0 0;
    border:none;

    &:hover{
        color: white;
        border: var(--primary);
        background-color: var(--primary);
    }
`
const VoteCount = styled.div`
    font-weight:800;
    font-size:1.3em;
    line-height:32px;
    color: var(--primary);
`

const Identity = styled.img`
    width:60px;
    height:60px;
    border-radius:50px;
    margin-right: 10px;

    @media only screen and (max-width: 649px) {
        width:40px;
        height:40px;
    }
`

const ImportFreq = styled.div`
    color: var(--primary);
    font-weight: 800;
    position: relative;

    span {
        position: absolute;
        top: -30px;
        width: 200px;
    }
`

const DateContainer = styled.span`
    color:#789;
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
        const src = this.props.src ? this.props.src : "data:image/png;base64," + data.toString();

        return (
            <Identity width="35" height="35" src={src}/>
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
        let {content} = this.props;
        const {user, index, onClick, date, poster, fontsize, backing, chain, approvedChain} = this.props;

        const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        const regex = new RegExp(expression);

        let linkFound = false;
        const matches = content.match(regex);
        if (matches) {
            linkFound = true;
            for(let i = 0; i < matches.length; i++) {
                const linkText = matches[i];
                const linkHref = linkText.startsWith("http") ? linkText : "http://" + linkText;
                const link = `<a href=${linkHref}>${linkText}</a>`
                content = content.replace(linkText, link)
            }
        }  

        const username = user && user.username !== '' ? '@' + user.username : poster.slice(0,6)
        const imageUrl = user ? user.picture : null;

        const publishDate = date ? displayPublishDate(date) : '';
        const voteLink = onClick ? <VoteLink onClick={() => onClick(index, chain)}><Icon/></VoteLink> : <div></div>;
        return (
            <ContentContainer>
                <ContentHeader>
                    <LinkToUser to={'/u/' + poster}>
                        <Identicon poster={poster} src={imageUrl}/>
                    </LinkToUser>
                    {approvedChain && 
                        <ImportFreq><span>{approvedChain.username} approved</span></ImportFreq>
                    }
                    <LinkToUser to={'/u/' + poster}>
                        <span>{username}</span>
                    </LinkToUser>
                    <DateContainer>&nbsp;- {publishDate} ago</DateContainer>
                </ContentHeader>
                <ContentBody fontsize={fontsize}>
                    {linkFound && 
                        <span dangerouslySetInnerHTML={{ __html: content }}></span>
                    }
                    {!linkFound &&
                        <span>{content}</span>
                    }
                </ContentBody>
                { onClick &&
                    <ContentFooter>
                        {voteLink}
                        <VoteCount>{(backing + 1) * 10}</VoteCount>
                    </ContentFooter>
                }
            </ContentContainer>
        )
    }
}
