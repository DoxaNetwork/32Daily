import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { loadLatestHistory, loadAllHistory } from './actions'

import { ContentCard } from './ContentCard.js'

import styled from 'styled-components';


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

class _PublishedWords extends Component {
    async componentDidMount() {
        this.props.loadLatestHistory()
    }

    render() {
        const publishedWords = this.props.publishedWords.map((word,index) =>
            <ContentCard 
                key={word.index} 
                index={word.index} 
                word={word.content} 
                poster={word.poster}
                backing={0}
                onClick={false} />
        );

        const showAllHistoryLink = this.props.allPreLoaded ? '' : <SecondaryActionLink onClick={this.props.loadAllHistory}>See full history</SecondaryActionLink>;

        return (
            <div>
                <div className="sectionTitle">Current mood</div>
                <div className="sectionTitle">Past moods</div>
                    {publishedWords}
                <CSSTransitionGroup
                    transitionName="opacity"
                    transitionEnterTimeout={5000}
                    transitionLeaveTimeout={300}>
                </CSSTransitionGroup>
                {showAllHistoryLink}
            </div>            
        )
    }
}

const mapStateToProps = state => ({
    publishedWords: state.freq1.history,
    allPreLoaded: state.freq1.historyLoaded
})

const mapDispatchToProps = dispatch => ({
    loadLatestHistory: () => dispatch(loadLatestHistory('freq1')),
    loadAllHistory: () => dispatch(loadAllHistory('freq1'))
})

export const PublishedWords = connect(
    mapStateToProps,
    mapDispatchToProps
)(_PublishedWords)

const mapStateToProps2 = state => ({
    publishedWords: state.freq2.history,
    allPreLoaded: state.freq2.historyLoaded
})

const mapDispatchToProps2 = dispatch => ({
    loadLatestHistory: () => dispatch(loadLatestHistory('freq2')),
    loadAllHistory: () => dispatch(loadAllHistory('freq2'))
})

export const PublishedWords2 = connect(
    mapStateToProps2,
    mapDispatchToProps2
)(_PublishedWords)