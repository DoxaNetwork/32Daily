import React, { Component } from 'react'
import BackableTokenContract from '../build/contracts/BackableToken.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

// TODO test changing this to web3 or ethjs
const contract = require('truffle-contract')
const token = contract(BackableTokenContract)

class App extends Component {
  constructor(props) {
    super(props)

    // TODO learn how to use state
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
      userCount: null,
      account: null,
      tokenInstance: null,
      usernames: [], // TODO how to present this better?
    }

  }

  async componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    try {
      let results = await getWeb3
      this.setState({web3: results.web3})

      // Instantiate contract once web3 provided.
      token.setProvider(this.state.web3.currentProvider)
    } catch (err) {
      console.log('Error finding web3.')
    }

     this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({account: accounts[0]}) //TODO how to let user choose address?
    })

    let tokenInstance = await token.deployed()
    this.setState({tokenInstance: tokenInstance})
  }

  async getUsers() {
      // let tokenInstance = await token.deployed()
      let result = await this.state.tokenInstance.memberCount()

      return this.setState({userCount: result.c[0]})
  }

  async getAllUsers() {      
    let tokenInstance = await token.deployed()

    let indexes = [1,2]

    const functions = indexes.map(index => tokenInstance.members(index))
    let results = await Promise.all(functions)

    let usernames = []
    for (const [username, address, active] of results) {
      usernames.push(username)
    }

    this.setState({usernames: usernames})
  }

  async clickButton() {
    let tokenInstance = this.state.tokenInstance

    // TODO better way to do this
    let users = this.state.users
    users.push(this.state.username)
    users.push(', ')
    this.setState({users: users})

    let result = await tokenInstance.register.sendTransaction(this.state.username, {from: this.state.account, value: new window.web3.BigNumber(window.web3.toWei(1,'ether'))})

    let result2 = await tokenInstance.totalTokens(this.state.account)

    this.setState({storageValue: result2.c[0]})
  }

  // TODO clean these up
  handleSearchChange(event) {
    this.setState({search: event.target.value})
  }

  handleUserNameChange(event) {
    this.setState({username: event.target.value})
  }

  async search() {
    let tokenInstance = this.state.tokenInstance
    let [username, address, active] = await tokenInstance.findMemberByUserName(this.state.search)
    this.setState({address: address})

    let result = await tokenInstance.totalTokens(address)

    this.setState({backing: result.c[0]})
  }

  async getElected() {
    let tokenInstance = this.state.tokenInstance
    let result = await tokenInstance.checkElectionStatus(this.state.address);

    let text = result ? 'yes!' : 'NOPE'
    this.setState({ elected: text })
  }

  // TODO build out some components
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
              user list: {this.state.usernames}
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
