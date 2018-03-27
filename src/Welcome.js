import React, { Component } from 'react'
import Submit from './Submit'
import UserPosts from './UserPosts'
import { postLink, getAllLinks } from './DappFunctions'


class Welcome extends Component {

    constructor(props) {
        super(props)

        this.state = {
            posts: []
        }
    }

    async componentWillMount() {
        var posts = await getAllLinks();
        posts = posts.filter(post => post.owner == this.props.user.address)
        this.setState({posts})
    }

    async postLink(content) {
        const result = await postLink(content);
        const newPost = result.logs[0].args;
        this.setState({ posts: [...this.state.posts, newPost] })
    }

    render () {
        return (
            <div>
                <h1>
                    Welcome Back, {this.props.user.username}!
                </h1>
                <p>Your address is {this.props.user.address}, and you have {this.props.user.balance.toNumber()} Doxa Tokens</p>
                <Submit onSubmit={this.postLink.bind(this)} />
                <UserPosts posts={this.state.posts} />
            </div>
        )
    }
}

export default Welcome