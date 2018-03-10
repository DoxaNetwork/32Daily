import React, { Component } from 'react'

import MemberTable from './MemberTable'
import Join from './Join'
import Welcome from './Welcome'
import Submit from './Submit'
import { getCurrentUser, getAllUsers, registerUser, backMember, postLink } from './DappFunctions'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {

    constructor(props) {
        super(props);
        this.state = { users: [], currentUser: undefined }
    }

    async componentWillMount() {
        const users = await getAllUsers();
        const currentUser = await getCurrentUser();
        this.setState({users, currentUser})
    }

    render() {
        let header = ''
        let availableBalance = 0
        if (this.state.currentUser === undefined){
            header = <Join onSubmit={registerUser} />;
            availableBalance = 0;
        } else {
            header = <Welcome user={this.state.currentUser} />
            availableBalance = this.state.currentUser.balance
        }

        return (
            <div className="App">
                <main>
                    <div>
                        {header}
                        <MemberTable users={this.state.users} availableBalance={availableBalance} />
                        <Submit onSubmit={postLink} />
                    </div>
                </main>
            </div>
        );
    }
}
export default App
