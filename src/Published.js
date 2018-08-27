import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import { initHistory, allHistory } from './redux'
import { Link } from 'react-router-dom'

class PublishedWord extends Component {
    render() {
        return (
            <div key={this.props.word.content}>
                <div className="publishedWordContainer">
                    <div className="word">
                        {this.props.word.content}
                    </div>
                    <div className="date">
                        {this.props.word.date}
                    </div>
                    <div className="identity">
                        <Link to={'1000/' + this.props.word.poster}> {this.props.word.poster.substring(0,6)}</Link>
                    </div>
                </div>
            </div>
        )
    }
}

export class PublishedWords extends Component {
    async componentDidMount() {
        this.props.initHistory()
    }

    render() {
        const firstWord = this.props.publishedWords.map((word, index) => {
            return index == 0 ? <PublishedWord  key={word.content} word={word} /> : '';
        });

        const publishedWords = this.props.publishedWords.map((word, index) => {
            return index == 0 ? '' : <PublishedWord  key={word.content} word={word} />
        });

        const showAllHistoryLink = this.props.allPreLoaded ? '' : <div className="showHistory link" onClick={this.props.allHistory}>See full history</div>;

        return (
            <div>
                <div className="sectionTitle">Current mood</div>
                <div className="yesterday">
                    {firstWord}
                </div>
                <div className="sectionTitle">Past moods</div>
                <div className="wordStreamInner">
                    <CSSTransitionGroup
                        transitionName="opacity"
                        transitionEnterTimeout={5000}
                        transitionLeaveTimeout={300}>
                        {publishedWords}
                    </CSSTransitionGroup>
                </div>
                {showAllHistoryLink}
            </div>            
        )
    }
}

const mapStateToProps3 = state => ({
    publishedWords: state.history,
    allPreLoaded: state.historyLoaded
})

const mapDispatchToProps3 = dispatch => ({
    initHistory: () => dispatch(initHistory()),
    allHistory: () => dispatch(allHistory())
})

export const PublishedWordsRedux = connect(
    mapStateToProps3,
    mapDispatchToProps3
)(PublishedWords)