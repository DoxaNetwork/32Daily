import React, { Component } from 'react'
import BackableTokenContract from '../build/contracts/BackableToken.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const contract = require('truffle-contract')
const token = contract(BackableTokenContract)

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      tokenInstance: null,
      users: [],
      search: '',
      backing: null,
      elected: null,
      address: null,
      username: '',
      userCount: null
    }

  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      token.setProvider(this.state.web3.currentProvider)
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  getUsers() {
    var tokenInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      token.deployed().then((instance) => {
        tokenInstance = instance

        // Buys 1 ether worth of token
        return tokenInstance.memberCount();
      }).then((result) => {
        console.log(result)
        return this.setState({userCount: result.c[0] })
      })
    })
  }

  getAllUsers() {
    var tokenInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      token.deployed().then((instance) => {
        tokenInstance = instance

        return tokenInstance.members(1)

        // return tokenInstance.register.sendTransaction(this.state.username, {from: accounts[0], value: new window.web3.BigNumber(window.web3.toWei(1,'ether'))});
      }).then((result) => {
        console.log(result)
        // Get the value from the contract to prove it worked.
        return tokenInstance.totalTokens(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })

    })
  }

  clickButton() {
    var tokenInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      token.deployed().then((instance) => {
        tokenInstance = instance

        // Buys 1 ether worth of token
        let users = this.state.users
        users.push(this.state.username)
        users.push(', ')
        this.setState({users: users})
        // this.getusers.push(this.state.username)
        return tokenInstance.register.sendTransaction(this.state.username, {from: accounts[0], value: new window.web3.BigNumber(window.web3.toWei(1,'ether'))});
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return tokenInstance.totalTokens(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })

    })
  }

  handleSearchChange(event) {
    this.setState({search: event.target.value})
  }

  handleUserNameChange(event) {
    this.setState({username: event.target.value})
  }

  search() {
     var tokenInstance

    console.log(this.state.search);

    this.state.web3.eth.getAccounts((error, accounts) => {
      token.deployed().then((instance) => {
        tokenInstance = instance

        // Buys 1 ether worth of token
        return tokenInstance.findMemberByUserName(this.state.search);
      }).then((result) => {
        let [username, address, active] = result
        this.setState({address: address})

        return tokenInstance.totalTokens(address);
        // Get the value from the contract to prove it worked.
      }).then((result) => {
        // Update state with the result.
        return this.setState({ backing: result.c[0] })
      })
    })

  }

  getElected() {
    var tokenInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      token.deployed().then((instance) => {
        tokenInstance = instance

        // Buys 1 ether worth of token
        return tokenInstance.checkElectionStatus(this.state.address);
      }).then((result) => {
        let a
        if (result) {
          a = 'yes!'
        } else {
          a = "NOPE"
        }
        return this.setState({ elected: a })
      })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Toasty</a>
        </nav>

        

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p>User count: {this.state.userCount}</p> 
              <button onClick={this.getUsers.bind(this)}>update user count</button>
              <p>Your tokens: {this.state.storageValue}</p>
              <form>
                Username
                <input type="text" name="username" value={this.state.username} onChange={this.handleUserNameChange.bind(this)}></input>
              </form>
              <button onClick={this.clickButton.bind(this)}>Join</button>

              Look up user
              <form>
                Username
                <input type="text" name="username_search" value={this.state.search} onChange={this.handleSearchChange.bind(this)}></input>
              </form>
              <button onClick={this.search.bind(this)}>Look up user</button>
              User has {this.state.backing} backing votes

              <div>
              <button onClick={this.getElected.bind(this)}>Is this user elected?</button>
              <div>
              {this.state.elected}
              </div>
              </div>
              <div>
              user list: {this.state.users}
              </div>

              <div>
                <button onClick={this.getAllUsers.bind(this)}>Get all users</button>
              </div>


            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
