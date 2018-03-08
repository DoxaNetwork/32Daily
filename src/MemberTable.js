import React, { Component } from 'react'

import MemberRow from './MemberRow'

class MemberTable extends Component {
    render() {
        let users = this.props.users;
        users.sort((a,b) => b.balance - a.balance )

        const maxTokens = users.reduce((acc, value) => Math.max(acc, value.balance.toNumber()), 0);

        const maxWidth = 500; // TODO this should not be in two places
        const threshold = 1000;
        const scale = maxWidth / maxTokens
        const thresholdScaled = threshold * scale + 40; // TODO we shouldnt have the ul margin hardcoded here

        let userList = users.map(({ address, username, elected, balance, backing }) =>
            <MemberRow key={address} username={username} elected={elected} balance={balance} backing={backing} maxTokens={maxTokens} availableBalance={this.props.availableBalance}/>
        )

        return (
            <div>
                <h2>Current Members</h2>
                <div style={{ position: 'relative' }}>
                    <ul style={{ listStyle: 'none' }}>
                        {userList}
                        <div style={{ position: 'absolute', border: '1px dashed darkgray', height: '100%', width: '0px', top: '0', left:`${thresholdScaled}px`}}/>
                    </ul>

                </div>
            </div>
        )
    }

}

export default MemberTable
