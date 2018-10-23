import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import styled from 'styled-components';

import { loadLatestHistory, loadAllHistory } from './actions'
import { ContentCard } from './ContentCard.js'


const SecondaryActionLink = styled.div`
    margin-top: 20px;
    color: var(--gray);
    cursor: pointer;
    text-align: center;

    &:hover {
        color: var(--primary);
    }
`

class _PublishedWords extends Component {
    componentDidMount() {
        this.props.loadLatestHistory()
    }

    render() {
        const publishedWords = this.props.publishedWords.map((word,index) =>
            <ContentCard 
                fontsize={20}
                key={word.poster + word.date + word.content} 
                index={word.index} 
                content={word.content} 
                poster={word.poster}
                user={this.props.users[word.poster]}
                backing={word.votes}
                date={word.date}
                onClick={false} />
        );

        const showAllHistoryLink = this.props.allPreLoaded ? '' : <SecondaryActionLink onClick={this.props.loadAllHistory}>See full history</SecondaryActionLink>;

        return (
            <div>
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

const mapFreqToStateToProps = freq => (
    state => ({
        publishedWords: state[freq].history,
        allPreLoaded: state[freq].historyLoaded,
        users: state.users,
    })
)

const mapFreqToDispatchToProps = freq => (
    dispatch => ({
        loadLatestHistory: () => dispatch(loadLatestHistory(freq)),
        loadAllHistory: () => dispatch(loadAllHistory(freq))
    })
)

export const PublishedWords1 = connect(
    mapFreqToStateToProps('freq1'),
    mapFreqToDispatchToProps('freq1')
)(_PublishedWords)

export const PublishedWords2 = connect(
    mapFreqToStateToProps('freq2'),
    mapFreqToDispatchToProps('freq2')
)(_PublishedWords)

export const PublishedWords3 = connect(
    mapFreqToStateToProps('freq3'),
    mapFreqToDispatchToProps('freq3')
)(_PublishedWords)