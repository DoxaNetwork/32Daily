import React, { Component } from 'react';
import { getAllLinks } from './DappFunctions'

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
        <li key={post.link}>{post.link}, address: {post.owner}</li>
        )

        return (
            <div>
                <h2>All Posts</h2>
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