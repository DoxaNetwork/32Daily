import React, { Component } from 'react'
import BackableTokenContract from '../build/contracts/BackableToken.json'
import getWeb3 from './utils/getWeb3'

import MemberTable from './MemberTable'
import Join from './Join'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const contract = require('truffle-contract')
const token = contract(BackableTokenContract)

async function getContract(contract) {
    let results = await getWeb3

    contract.setProvider(results.web3.currentProvider)

    return contract.deployed()
}

async function backMember(memberName, tokenAmount){
    const tokenInstance = await getContract(token);
    let results = await getWeb3
    var account = results.web3.eth.accounts[0];

    let member = await tokenInstance.findMemberByUserName(memberName)
    const address = member[0]  // The address of the user we find

    let result = await tokenInstance.back.sendTransaction(
        address, tokenAmount,
        { from: account, value: new window.web3.BigNumber(window.web3.toWei(0.02, 'ether')) }
    )
}

class App extends Component {

  render() {
    return (
      <div className="App">
        <h1>
          Sign Up
        </h1>
        <p>Sign up for your account here.  You can see everyone else signed up below.</p>
        <main>
          <div>
            <Join token={token} getContract={getContract} getWeb3={getWeb3}/>

            <MemberTable token={token} getContract={getContract}/>
          </div>
        </main>
      </div>
    );
  }
}
export default App
