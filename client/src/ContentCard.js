import React, { Component } from 'react'
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Button, Back } from './styledComponents'
import {  FaChevronUp   as Icon } from "react-icons/fa";
import Blockies from 'react-blockies';
import Media from 'react-media';
import pluralize from 'pluralize';
import ReactTooltip from 'react-tooltip'


const ContentContainer = styled.div`
    background-color:var(--white);
    border-radius: 5px;
    margin-top: 30px;
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
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
    font-size: 0.7em;
    padding: 10px 20px 20px 90px;
    @media only screen and (max-width: 649px) {
        padding: 10px 20px 15px 70px;
    }
    cursor: ${props => props.onClick ? "pointer" : "unset"};
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
    width: 32px;
    height: unset;
    padding: 5px;
    color: ${props => props.pendingVotes ? "var(--gray)" : "var(--primary)"};
    background-color:inherit;
    margin: 0 10px 0 0;
    border:none;

    ${ContentFooter}:hover & {
        color: white;
        border: var(--primary);
        background-color: var(--primary);
    }
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
    color: ${props => props.pendingVotes ? "var(--gray)" : "var(--primary)"};
`

const Identity = styled.div`
    margin-right: 10px;

    img {
        width:56px;
        height:56px;
        border-radius:50px;

        @media only screen and (max-width: 649px) {
            width:40px;
            height:40px;
        }
    }

    canvas {
        border-radius: 100px;
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

const Award = styled.span`
    color: var(--primary);
    font-weight: 800;
    font-size: 1.3em;
`

class Identicon extends Component {

    render() {
        return (
            <Identity>
                {this.props.src ? (
                    <img src={this.props.src}/>
                    ) : (
                    <Media query="(max-width: 649px)">
                        {mobile =>
                            mobile ? (
                                <Blockies
                                  seed={this.props.poster.toLowerCase()} /* the only required prop; determines how the image is generated */
                                  size={8} /* number of squares wide/tall the image will be; default = 15 */
                                  scale={5} /* width/height of each square in pixels; default = 4 */
                                />
                                ) : (
                                <Blockies
                                  seed={this.props.poster.toLowerCase()} /* the only required prop; determines how the image is generated */
                                  size={8} /* number of squares wide/tall the image will be; default = 15 */
                                  scale={7} /* width/height of each square in pixels; default = 4 */
                                />
                            ) }
                    </Media>
                    )}
            </Identity>
        )
    }
}

function displayDate(then) {
    const dateOptions = {month: 'short', day: 'numeric'};
    return then.toLocaleDateString('en-US', dateOptions)
}

function displayDays(then) {
    const now = new Date();
    const msec = now.getTime() - then.getTime();
    const days = Math.floor(msec / 1000 / 60 / 60 / 24)
    return `${days} days ago`
}

function displayHour(then) {
    const now = new Date();
    const msec = now.getTime() - then.getTime();
    const hours = Math.floor(msec / 1000 / 60 / 60);
    return `${hours} hours  ago`;
}

function displayMins(then) {
    const now = new Date();
    let msec = now.getTime() - then.getTime();
    const hours = Math.floor(msec / 1000 / 60 / 60);
    msec -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(msec / 1000 / 60);
    return `${minutes} mins  ago`;
}

function displaySecs(then) {
    const now = new Date();
    let msec = now.getTime() - then.getTime();
    const hours = Math.floor(msec / 1000 / 60 / 60);
    msec -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(msec / 1000 / 60);
    msec -= minutes * 1000 * 60;
    const seconds = Math.floor(msec / 1000);
    return `${seconds} secs ago`;
}

function displayPublishDate(then) {
    let dateDisplay;
    let msec = new Date() - then;
    if (msec > 604800000) {
        dateDisplay = displayDate(then)
    } else if (msec > 86400000) {
        dateDisplay = displayDays(then)
    } else if (msec > 3600000) {
        dateDisplay = displayHour(then)
    } else if (msec > 60000) {
        dateDisplay = displayMins(then)
    } else {
        dateDisplay = displaySecs(then)
    }
    return dateDisplay;
}


export class ContentCard extends Component {
    dateOptions = {month: 'short', day: 'numeric'};

    render() {
        let {content} = this.props;
        const {user, index, onClick, date, poster, fontsize, backing, chain, approvedChain, awarded, pending, pendingVotes} = this.props;

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

        const username = user && user.username !== '' ? '@' + user.username : poster.slice(0,6).toLowerCase()
        const imageUrl = user ? user.picture : null;

        const publishDate = !pending ? displayPublishDate(date) : 'pending';
        const voteLink = onClick ? <VoteLink onClick={() => onClick(index, chain)}><Icon/></VoteLink> : <div></div>;
        return (
            <ContentContainer>
                <ContentHeader>
                    <LinkToUser to={'/u/' + poster}>
                        <Identicon poster={poster} src={imageUrl}/>
                    </LinkToUser>
                    {approvedChain && 
                        <>
                        <ImportFreq ><span data-tip="already published by a lower chain">{approvedChain.username} published</span></ImportFreq>
                        <ReactTooltip className="custom-tooltip" effect="solid"/>
                        </>
                    }
                    <LinkToUser to={'/u/' + poster}>
                        <span>{username}</span>
                    </LinkToUser>
                    <DateContainer>&nbsp;- {publishDate}</DateContainer>
                </ContentHeader>
                <ContentBody fontsize={fontsize}>
                    {linkFound && 
                        <span dangerouslySetInnerHTML={{ __html: content }}></span>
                    }
                    {!linkFound &&
                        <span>{content}</span>
                    }
                </ContentBody>
                { onClick && !pending &&
                    <ContentFooter onClick={() => onClick(index, chain)}>
                        <VoteLink pendingVotes={pendingVotes}><Icon/></VoteLink> 
                        <VoteCount pendingVotes={pendingVotes} data-tip="how many people have voted for this">{(backing + 1)}</VoteCount>
                        <ReactTooltip className="custom-tooltip" effect="solid"/>
                    </ContentFooter>
                }
                { awarded && 
                    <ContentFooter>
                        <Award data-tip="credits are an ERC-20 token awarded to the creator">awarded {pluralize('credit', awarded, true)}</Award>
                        <ReactTooltip className="custom-tooltip" effect="solid"/>
                    </ContentFooter>
                }
            </ContentContainer>
        )
    }
}
