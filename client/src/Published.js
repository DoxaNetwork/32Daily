import React, { Component } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components';

import { loadLatestHistory, loadAllHistory } from './actions'
import { ContentCard } from './ContentCard.js'
import { ClimbingBoxLoader } from 'react-spinners';
import { FaChevronDown } from "react-icons/fa";


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

const Sort = styled.div`
    padding-top: 15px;
    display:flex;
    color: var(--gray);

    button { 
        padding-left: 5px;
        background: none;
        border: none;
        font-size: 1em;
        color: var(--primary); 
        display: flex;
        align-items: center; 
        cursor:pointer;
        outline: none;
        svg {
            padding-left: 10px;
        }

        &:hover {
            color: var(--bright);
        }
    }
`

class _PublishedWords extends Component {
    state = {
        sort: "newest",
        sorting: false
    }

    componentDidMount() {
        this.props.loadLatestHistory()
    }

    toggleSort() {
        if (this.state.sort == "newest") {
            if(!this.props.allPreLoaded) {
                this.props.loadAllHistory()
            }
            this.setState({sort: "oldest", sorting: true})

            setTimeout(() => this.setState({sorting: false}), 800)
        } else {
            this.setState({sort: "newest", sorting: true})

            setTimeout(() => this.setState({sorting: false}), 800)
        }
    }

    render() {
        const sortOldest = (i,j) => (i.date - j.date)
        const sortNewest = (i,j) => (j.date - i.date)
        const sortFns = {"newest": sortNewest, "oldest": sortOldest}
        const sortFn = sortFns[this.state.sort];

        const publishedWords = this.props.publishedWords.sort(sortFn).map((obj,index) =>
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
                <Sort>sorted by <button onClick={() => this.toggleSort()}><span>{this.state.sort}</span><FaChevronDown/></button></Sort>
                {this.props.loaded && !this.state.sorting &&
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
                  loading={!this.props.loaded || this.state.sorting}
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