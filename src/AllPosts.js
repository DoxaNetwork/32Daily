import React, { Component } from 'react';
import { getAllLinks, backPost, setUpPostListener, setUpPostBackedListener } from './DappFunctions'
import PostVoteItem from './PostVoteItem'

class AllPosts extends Component {

	constructor(props) {
		super(props)

		this.state = { posts: [] }
    }   

    async componentWillMount() {
        var posts = await getAllLinks();
        this.setState({posts});

        // set up listener for new posts
        const event = await setUpPostListener()
        event.watch((error, result) => {
            const newPost = result.args;
            this.setState({ posts: [...this.state.posts, newPost] })
            console.debug('new post event received')
        })

        // set up listener for new votes
        const backEvent = await setUpPostBackedListener();
        backEvent.watch((error, result) => {
            const index = result.args.postIndex;
            const backing = result.args.value;
            this.updatePost(index, backing);
            console.debug('new vote event received')
        })
    }

    updatePost(index, value) {
        const posts = this.state.posts;
        posts[index].backing = posts[index].backing.plus(value);
        this.setState({posts});
    }

    async backPost(postIndex, value) {
        const result = await backPost(postIndex, value);
        const backing = result.logs[0].args.value;
        const index = result.logs[0].args.postIndex;

        this.updatePost(result.logs[0].args.postIndex, result.logs[0].args.value)

        this.props.updateUserAvailableToBack(backing)
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