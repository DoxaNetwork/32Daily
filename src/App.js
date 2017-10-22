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
      users: null,
      search: '',
      backing: null,
      elected: null,
      address: null
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
        return tokenInstance.register.sendTransaction('enodios', {from: accounts[0], value: new window.web3.BigNumber(window.web3.toWei(1,'ether'))});
      }).then((result) => {
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
        return tokenInstance.register.sendTransaction('enodios', {from: accounts[0], value: new window.web3.BigNumber(window.web3.toWei(1,'ether'))});
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
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p>Your tokens: {this.state.storageValue}</p>
              <form>
                Username
                <input type="text" name="username"></input>
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



            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
