import React, { Component } from 'react'

class Join extends Component {

    constructor(props) {
        super(props)

        this.state = {
            username: ''        }
    }

    handleUserNameChange(event) {
        this.setState({username: event.target.value})
    }

    render() {
        return (
            <div>
                <h1>
                    Sign Up
                </h1>
                <p>Sign up for your account here.  You can see everyone else signed up below.</p>
                <h2>Become a member </h2>
                <form>
                    <p>
                        Username
                        <input type="text" name="username" value={this.state.username} onChange={this.handleUserNameChange.bind(this)}/>
                    </p>
                    <p>
                        You'll get 1000 Toasty tokens to play around with
                    </p>
                </form>
                <button onClick={() => this.props.onSubmit(this.state.username)}>Join</button>
            </div>
        )
    }
}

export default Join
