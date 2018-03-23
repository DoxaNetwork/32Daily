import React, { Component } from 'react';
import { getAllLinks, backPost } from './DappFunctions'
import PostVoteItem from './PostVoteItem'

class AllPosts extends Component {

	constructor(props) {
		super(props)

		this.state = { posts: [] }
    }   

    async componentWillMount() {
        var posts = await getAllLinks();
        this.setState({posts})
    }

	render() {
        let posts = this.state.posts;

        let postList = posts.map(post =>
            <PostVoteItem key={post.index} post={post} onSubmit={backPost} />
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