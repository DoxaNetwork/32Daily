import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"; 

import MemberTable from './MemberTable'
import Join from './Join'
import Welcome from './Welcome'
import AllPosts from './AllPosts'
import { getCurrentUser, getAllUsers, registerUser, backMember } from './DappFunctions'

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
            <Router>
                <div className="App">
                    <main>
                        <nav>
                            <Link to="/">Home</Link> | 
                            <Link to="/users">Users</Link> | 
                            <Link to="/posts">Posts</Link>
                        </nav>
                        <div>
                            <Route 
                                exact path="/" 
                                render={() => header} />
                            <Route 
                                path="/users" 
                                render={(props) => <MemberTable {...props} users={this.state.users} />} />
                            <Route 
                                path="/posts" 
                                render={(props) => <AllPosts />} />
                        </div>
                    </main>
                </div>
            </Router>
        );
    }
}
export default App
