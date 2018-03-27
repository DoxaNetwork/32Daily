import React, { Component } from 'react';

class UserPosts extends Component {

	constructor(props) {
		super(props)
    }

	render() {
        let posts = this.props.posts;

        let postList = posts.map(post =>
            <li key={post.link}>{post.link}</li>
        )

        return (
            <div>
                <h2>Your Posts</h2>
                <div style={{ position: 'relative' }}>
                    <ul>
                        {postList}
                    </ul>

                </div>
            </div>
        )
    }
}

export default UserPosts