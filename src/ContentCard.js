import React, { Component } from 'react'
import styled from 'styled-components';
import { Link } from 'react-router-dom'


const ContentContainer = styled.div`
    background-color:white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    margin-top: 30px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);

    /*&:hover {
        box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    }*/
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
    padding-right: 15px;
    font-weight: 700;

    &:hover {
        text-decoration: underline;
        color: var(--user-color);
    }
`
const VoteLink = styled.div`
    font-weight: 700;
    color:var(--main-color);
    &:hover {
        cursor: pointer;
        color: var(--secondary-color)
    }
`
const VoteCount = styled.div`
    font-weight:700;
    color: var(--main-color);
`

export class ContentCard extends Component {
    render() {
        const voteLink = this.props.onClick ? <VoteLink onClick={() => this.props.onClick(this.props.index)}>+ Vote</VoteLink> : <div></div>;
        return (
            <ContentContainer>
                <ContentHeader>
                    <LinkToUser to={'1000/' + this.props.poster}> {this.props.poster.substring(0,6)}</LinkToUser>
                    <div></div>
                </ContentHeader>
                <ContentBody fontsize={this.props.fontsize}>
                    {this.props.word}
                </ContentBody>
                <ContentFooter>
                    {voteLink}
                    <VoteCount>{this.props.backing}</VoteCount>
                </ContentFooter>
            </ContentContainer>
        )
    }
}

