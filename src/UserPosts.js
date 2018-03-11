import React, { Component } from 'react';
import { getAllLinks } from './DappFunctions'

class UserPosts extends Component {

	constructor(props) {
		super(props)

		this.state = { posts: [] }
    }   

    async componentWillMount() {
        var posts = await getAllLinks();
        posts = posts.filter(post => post.owner == this.props.user.address)
        this.setState({posts})
    }

	render() {
        let posts = this.state.posts;

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