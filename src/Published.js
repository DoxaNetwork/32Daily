import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { loadLatestHistory, loadAllHistory } from './actions'

import styled from 'styled-components';

const PublishedContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin:0 5px 5px;
    border-radius: var(--border-radius);
    overflow: hidden;
    justify-content: space-between;
    background-color: var(--white);
    height: 125px;
    padding-bottom: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
`
const Word = styled.div`
    padding: 10px 15px;
    background-color:var(--white);
    color: black;
    width: 100%;
`

const SecondaryActionLink = styled.div`
    margin-top: 20px;
    color: var(--gray);
    cursor: pointer;
    text-align: center;

    &:hover {
        color: var(--main-color);
    }
`
const LinkToUser = styled(Link)`
    margin-right: 20px;
    color: var(--gray);
`
const Date = styled.div`
    padding: 0 15px;
    background-color: white;
    color: var(--gray);
    width:65px;
    border-radius: 0 10px 10px 0;
`


class PublishedWord extends Component {
    render() {
        return (
            <div key={this.props.word.content}>
                <PublishedContainer>
                    <Word>
                        {this.props.word.content}
                    </Word>
                    <Date>
                        {this.props.word.date}
                    </Date>
                    <div className="identity">
                        <LinkToUser to={'1000/' + this.props.word.poster}> {this.props.word.poster.substring(0,6)}</LinkToUser>
                    </div>
                </PublishedContainer>
            </div>
        )
    }
}

class _PublishedWords extends Component {
    async componentDidMount() {
        this.props.loadLatestHistory()
    }

    render() {
        const firstWord = this.props.publishedWords.map((word, index) => {
            return index == 0 ? <PublishedWord  key={word.content} word={word} /> : '';
        });

        const publishedWords = this.props.publishedWords.map((word, index) => {
            return index == 0 ? '' : <PublishedWord  key={word.content} word={word} />
        });

        const showAllHistoryLink = this.props.allPreLoaded ? '' : <SecondaryActionLink onClick={this.props.loadAllHistory}>See full history</SecondaryActionLink>;

        return (
            <div>
                <div className="sectionTitle">Current mood</div>
                <div className="yesterday">
                    {firstWord}
                </div>
                <div className="sectionTitle">Past moods</div>
                <CSSTransitionGroup
                    transitionName="opacity"
                    transitionEnterTimeout={5000}
                    transitionLeaveTimeout={300}>
                    {publishedWords}
                </CSSTransitionGroup>
                {showAllHistoryLink}
            </div>            
        )
    }
}

const mapStateToProps = state => ({
    publishedWords: state.history,
    allPreLoaded: state.historyLoaded
})

const mapDispatchToProps = dispatch => ({
    loadLatestHistory: () => dispatch(loadLatestHistory()),
    loadAllHistory: () => dispatch(loadAllHistory())
})

export const PublishedWords = connect(
    mapStateToProps,
    mapDispatchToProps
)(_PublishedWords)