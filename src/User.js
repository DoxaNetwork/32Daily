import React, { Component } from 'react'
import { connect } from 'react-redux'

import { ByteArrayToString } from './utils/helpers'

import contract from 'truffle-contract'
import { getContract } from './DappFunctions'
import DoxaHubContract from '../build/contracts/DoxaHub.json'
const doxaHubContract = contract(DoxaHubContract)


import { SubmittedWordRedux } from './Submitted'

function mapPost(post) {
    return {'poster': post.owner, 'word': ByteArrayToString(post.link), 'backing': post.backing.toNumber(), 'index': post.index.toNumber()}
}

class User extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userId: '',
            submittedWords: [],
            publishedWords: [],
        }
    }

    mapPost(post) {
        return {'poster': post.owner, 'word': ByteArrayToString(post.content), 'version': post.version.toNumber()}
    }

    async componentWillMount() {
        const doxaHub = await getContract(doxaHubContract);
        const userId = this.props.match.params.id;

        const submittedWords = []
        const filter = doxaHub.LinkPosted({owner: userId}, {fromBlock:0})
        filter.get((e,r) => {
            for(let i = 0; i < r.length; i++) {
                const word = mapPost(r[i].args)
                submittedWords.push(word)
            }
            this.setState({submittedWords})
        })

        const publishedWords = []
        const filter2 = doxaHub.Published({owner: userId}, {fromBlock:0})
        filter2.get((e,r) => {
            for(let i = 0; i < r.length; i++) {
                const word = this.mapPost(r[i].args)
                publishedWords.push(word)
            }
            this.setState({publishedWords})
        })

        this.setState({
            userId
        })
    }

    render() {
        const submittedWords = this.state.submittedWords.map(obj =>
            <SubmittedWordRedux
                key={obj.word}
                index={obj.index}
                word={obj.word}
                poster={obj.poster}
                backing={obj.backing}/>
        );

        const publishedWords = this.state.publishedWords.map(obj =>
            <SubmittedWordRedux
                key={obj.word}
                index={0}
                word={obj.word}
                poster={obj.poster}
                backing={0}/>
        );
        return (
            <div>
                <div className="userContainer">
                    <div className="row">
                        <div>user id</div>
                        <div className="row-value">{this.state.userId.substring(0,6)}</div>
                    </div>
                    <div className="row">
                        <div>token balance</div>
                        <div className="row-value">{this.props.tokenBalance}</div>
                    </div>
                    <div className="row">
                        <div>available votes</div>
                        <div className="row-value">{this.props.availableVotes}</div>
                    </div>
                    <div className="row">
                        <div>submitted posts</div>
                        <div className="row-value">todo</div>
                    </div>
                    <div className="row">
                        <div>published posts</div>
                        <div className="row-value">todo</div>
                    </div>
                    <div className="address">{this.state.userId}</div>
                </div>
                <div className="user-submittedPosts">
                    <h2>Submitted Posts</h2>
                    {submittedWords}
                </div>
                <div className="user-submittedPosts">
                    <h2>Published Words</h2>
                    {publishedWords}
                </div>

            </div>
        )
    }
}

const mapStateToProps5 = state => ({
    tokenBalance: state.user.balance,
    availableVotes: state.user.available
})
export const UserRedux = connect(
    mapStateToProps5
)(User)