import React, { Component } from 'react'

class Join extends Component {

    constructor(props) {
        super(props)

        this.state = {
            username: '',
            etherAmount: 1
        }
    }

    handleUserNameChange(event) {
        this.setState({username: event.target.value})
    }

    handleEtherAmountChange(event) {
        this.setState({etherAmount: event.target.value})
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
                        Ether amount
                        <input type="number" name="etherAmount" value={this.state.etherAmount} onChange={this.handleEtherAmountChange.bind(this)}/>
                    </p>
                    <p>
                        Buys you {this.state.etherAmount * 1000} Toasty tokens
                    </p>
                </form>
                <button onClick={() => this.props.onSubmit(this.state.username, this.state.etherAmount)}>Join</button>
            </div>
        )
    }
}

export default Join
