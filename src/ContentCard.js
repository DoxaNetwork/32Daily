import React, { Component } from 'react'
import styled from 'styled-components';
import { Link } from 'react-router-dom'


export const ContentContainer = styled.div`
    background-color:white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    margin: 20px;
`
export const ContentHeader = styled.div`
    display:flex;
    justify-content: space-between;
    padding: 20px 20px 10px;
`
export const ContentBody = styled.div`
    padding: 20px 20px;
`
export const ContentFooter = styled.div`
    display:flex;
    justify-content: space-between;
    border-top: 1px solid gray;
    padding: 10px 20px;
`
export const LinkToUser = styled(Link)`
    color: var(--gray);
    float: right;
    padding-right: 15px;
`

export class ContentCard extends Component {
    render() {
        const voteLink = this.props.onClick ? <div onClick={() => this.props.onClick(this.props.index)}>+ Vote</div> : <div></div>;
        return (
            <ContentContainer>
                <ContentHeader>
                    <div><LinkToUser to={'1000/' + this.props.poster}> {this.props.poster.substring(0,6)}</LinkToUser></div>
                    <div>10m</div>
                </ContentHeader>
                <ContentBody>
                    {this.props.word}
                </ContentBody>
                <ContentFooter>
                    {voteLink}
                    <div>{this.props.backing}</div>
                </ContentFooter>
            </ContentContainer>
        )
    }
}

