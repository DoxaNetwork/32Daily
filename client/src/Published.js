import React, { Component } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components';

import { loadLatestHistory, loadAllHistory } from './actions'
import { ContentCard } from './ContentCard.js'
import { ClimbingBoxLoader } from 'react-spinners';

const override = css`
    margin: 20px auto;
`

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
        const publishedWords = this.props.publishedWords.map((obj,index) =>
            <CSSTransition
                key={obj.index} 
                classNames="opacity"
                appear
                timeout={{ enter: 300, exit: 300 }}>
                <ContentCard 
                    fontsize={20}
                    index={obj.index} 
                    content={obj.content} 
                    poster={obj.poster}
                    user={this.props.users[obj.poster]}
                    backing={obj.votes}
                    date={obj.date}
                    awarded={this.props.awarded}
                    onClick={false} />
                </CSSTransition>
        );

        const showAllHistoryLink = this.props.allPreLoaded ? '' : <SecondaryActionLink onClick={this.props.loadAllHistory}>See full history</SecondaryActionLink>;

        return (
            <div>
                {this.props.loaded && 
                    <>
                        <TransitionGroup>
                            {publishedWords}
                        </TransitionGroup>
                        {showAllHistoryLink}
                    </>
                }
                <ClimbingBoxLoader
                  className={`${override}`}
                  color={'#266DD3'}
                  loading={!this.props.loaded}
                />
            </div>            
        )
    }
}

const awardSchedule = {
    'freq1': 1,
    'freq2': 12,
    'freq3': 168
}

const mapFreqToStateToProps = freq => (
    state => ({
        publishedWords: state[freq].history,
        allPreLoaded: state[freq].historyLoadedAll,
        loaded: state[freq].historyLoadedSome,
        users: state.users,
        awarded: awardSchedule[freq]
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