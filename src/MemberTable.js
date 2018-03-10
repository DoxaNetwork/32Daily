import React, { Component } from 'react'

import MemberRow from './MemberRow'

class MemberTable extends Component {
    render() {
        let users = this.props.users;
        users.sort((a,b) => b.balance - a.balance )

        let userList = users.map(({ address, username, elected, balance, backing }) =>
            <MemberRow key={address} username={username} balance={balance}/>
        )

        return (
            <div>
                <h2>Current Members</h2>
                <div style={{ position: 'relative' }}>
                    <ul>
                        {userList}
                    </ul>

                </div>
            </div>
        )
    }

}

export default MemberTable
