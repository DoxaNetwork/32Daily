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

async function getContract(contract) {
  let results = await getWeb3

  contract.setProvider(results.web3.currentProvider)

  return contract.deployed()
}

class App extends Component {
  constructor(props) {
    super(props)

    // TODO learn how to use state
    this.state = {
      storageValue: 0,
      users: [],
      backing: null,
      elected: null,
      userCount: null,
      usernames: [], // TODO how to present this better?
      tokenInstance: null // TODO is this the right place to put this?
    }

    this.getAllUsers.bind(this)
    this.getUsers.bind(this)
  }

  // TODO shouldnt have this repeated 3 times
  async getAccount() {
    let results = await getWeb3
    // TODO make this a promise
    results.web3.eth.getAccounts((error, accounts) => {
      this.account = accounts[0] //TODO how to let user choose address?
    })
  }

  async componentWillMount() {
    this.tokenInstance = await getContract(token);
    await this.getAccount();
  }

  async getUsers() {
      let result = await this.tokenInstance.memberCount()

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

  render() {
    return (
      <div className="App">
        <main>
          <div>
            <div>
              {this.props.children} - {this.props.name}
              <p>User count: {this.state.userCount}</p> 
              <button onClick={this.getUsers}>update user count</button>
              <p>Your tokens: {this.state.storageValue}</p>

              <Join/>

              <Search/>

              <div>
              user list: {this.state.usernames}
              </div>

              <div>
                <button onClick={this.getAllUsers}>Get all users</button> 
              </div>

            </div>
          </div>
        </main>
      </div>
    );
  }
}

class Search extends Component {

  constructor(props) {
    super(props);

    this.state = {
      search: '',
      address: null,
    };

    this.getElected.bind(this)
    this.search.bind(this)
    this.handleSearchChange.bind(this)
  }

  async getAccount() {
    let results = await getWeb3
    // TODO make this a promise
    results.web3.eth.getAccounts((error, accounts) => {
      this.account = accounts[0] //TODO how to let user choose address?
    })
  }

  async componentWillMount() {
    this.tokenInstance = await getContract(token);
    await this.getAccount();
  }

  async getElected() {
    let result = await this.tokenInstance.checkElectionStatus(this.state.address);

    let text = result ? 'yes!' : 'NOPE'
    this.setState({ elected: text })
  }

  async search() {
    let [username, address, active] = await this.tokenInstance.findMemberByUserName(this.state.search)
    this.setState({address: address})

    let result = await this.tokenInstance.totalTokens(address)

    this.setState({backing: result.c[0]})
  }

  handleSearchChange(event) {
    this.setState({search: event.target.value})
  }

  render() {
    return (
      <div>
        Look up user
        <form>
          Username
          <input type="text" name="username_search" value={this.state.search} onChange={this.handleSearchChange.bind(this)}/>
        </form>
        <button onClick={this.search.bind(this)}>Look up user</button>
        User has {this.state.backing} backing votes

        <button onClick={this.getElected}>Is this user elected?</button>
        {this.state.elected}
      </div>
    )
  }
}

class Join extends Component {

  constructor(props) {
    super(props)

    this.state = {
      username: ''
    }

    this.handleUserNameChange.bind(this) // TODO why doesn't this work?
    this.clickButton.bind(this)
  }

  async getAccount() {
    let results = await getWeb3

    // TODO make this a promise
    results.web3.eth.getAccounts((error, accounts) => {
      this.account = accounts[0] //TODO how to let user choose address?
    })
  }

  async componentWillMount() {
    this.tokenInstance = await getContract(token);
    await this.getAccount();
  }

  handleUserNameChange(event) {
    this.setState({username: event.target.value})
  }

  async clickButton() {
    let result = await this.tokenInstance.register.sendTransaction(this.state.username, {from: this.account, value: new window.web3.BigNumber(window.web3.toWei(1,'ether'))})

    let result2 = await this.tokenInstance.totalTokens(this.account)

    this.setState({storageValue: result2.c[0]})
  }

  render() {
   return (
     <div>
      <form>
        Username
        <input type="text" name="username" value={this.state.username} onChange={this.handleUserNameChange.bind(this)}/>
      </form>
      <button onClick={this.clickButton.bind(this)}>Join</button>
    </div>
    )
  }
}

export default App
