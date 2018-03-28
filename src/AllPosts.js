import React, { Component } from 'react';
import { getAllLinks, backPost, setUpListeners } from './DappFunctions'
import PostVoteItem from './PostVoteItem'

class AllPosts extends Component {

	constructor(props) {
		super(props)

		this.state = { posts: [] }
    }   

    async componentWillMount() {
        var posts = await getAllLinks();
        const event = await setUpListeners()
        event.watch((error, result) => {
            const newPost = result.args;
            this.setState({ posts: [...this.state.posts, newPost] })
        })
        this.setState({posts})
    }

    async backPost(postIndex, value) {
        const result = await backPost(postIndex, value);
        const posts = this.state.posts;
        const index = result.logs[0].args.postIndex;
        const backing = result.logs[0].args.value;

        posts[index].backing = posts[index].backing.plus(backing);
        this.setState({posts})
    }

	render() {
        let posts = this.state.posts;

        let postList = posts.map(post =>
            <PostVoteItem key={post.index} post={post} onSubmit={this.backPost.bind(this)} />
        )

        return (
            <div>
                <h2>All Posts</h2>
                Available for backing: {this.props.user && this.props.user.availableToBackPosts.toNumber()}
                <div style={{ position: 'relative' }}>
                    <ul>
                        {postList}
                    </ul>

                </div>
            </div>
        )
    }
}

export default AllPosts