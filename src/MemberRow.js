import React, { Component } from 'react';

class MemberRow extends Component {

    render() {
        return (
            <li>
                <div>{this.props.username} ({this.props.address}) => {this.props.balance.toNumber()} Doxa Tokens</div>
            </li>
        )
    }
}

export default MemberRow
