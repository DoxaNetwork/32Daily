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
                        <Join />

                        <MemberTable />
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
        this.setState({ address: address })

        let result = await this.tokenInstance.totalTokens(address)

        this.setState({ backing: result.c[0] })
    }

    handleSearchChange(event) {
        this.setState({ search: event.target.value })
    }

    render() {
        return (
            <div>
                Look up user
        <form>
                    Username
          <input type="text" name="username_search" value={this.state.search} onChange={this.handleSearchChange.bind(this)} />
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
            username: '',
            etherAmount: 1
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
        this.setState({ username: event.target.value })
    }

    handleEtherAmountChange(event) {
        this.setState({ etherAmount: event.target.value })
    }

    async clickButton() {
        let result = await this.tokenInstance.register.sendTransaction(
            this.state.username,
            { from: this.account, value: new window.web3.BigNumber(window.web3.toWei(this.state.etherAmount, 'ether')) }
        )
    }

    render() {
        return (
            <div>
                <h2>Become a member </h2>
                <form>
                    <p>
                        Username
          <input type="text" name="username" value={this.state.username} onChange={this.handleUserNameChange.bind(this)} />
                    </p>
                    <p>
                        Ether amount
          <input type="number" name="etherAmount" value={this.state.etherAmount} onChange={this.handleEtherAmountChange.bind(this)} />
                    </p>
                    <p>
                        Buys you {this.state.etherAmount * 1000} Toasty tokens
        </p>
                </form>
                <button onClick={this.clickButton.bind(this)}>Join</button>
            </div>
        )
    }
}


class MemberRow extends Component {
    constructor(props) {
        super(props);
        this.handleBackMember = this.handleBackMember.bind(this);
    }

    handleBackMember() {
        if (confirm(`Back this member ${this.props.username} with ${this.props.availableBalance} tokens?`)){
            backMember(this.props.username, 1).then(alert('Transaction successfull')).catch(alert('Transaction failed'))
        }
    }

    render() {

        const maxWidth = 500;
        const scale = maxWidth / this.props.totalTokens; // multiply this times a token quantity to get a pixel quantity
        // const scaledWidth = this.props.balance.toNumber() / this.props.totalTokens * maxWidth;
        // const scaledWidth = this.props.balance.toNumber() / this.props.totalTokens * maxWidth;

        const balanceWidth = this.props.balance.toNumber() * scale;
        const availableWidth = this.props.availableBalance * scale;

        return (
            <li>
                <div style={{ display: 'flex' }}>
                    <div style={{ backgroundColor: this.props.elected ? '#087F8C' : '#5AAA95', width: `${balanceWidth}px`, height: '20px' }}></div>
                    <div style={{ backgroundColor: '#DEE5E5', width: `${availableWidth}px`, height: '20px' }} onClick={this.handleBackMember}></div>
                </div>
                <div> Username: {this.props.username}</div>
                <div> Balance: {this.props.balance.toNumber()} </div>
                <div> Backing: {this.props.backing.toNumber()} </div>
                <div> {this.props.elected ? '' : 'NOT'} Elected  </div>
            </li>
        )
    }
}

class MemberTable extends Component {

    constructor(props) {
        super(props)

        this.state = {
            users: [],
            totalTokens: null
        }
    }

    async componentWillMount() {
        this.tokenInstance = await getContract(token);

        // TODO this code should also be modular
        // const users = getAllUsers()
        const memberCount = await this.tokenInstance.memberCount()
        const indexesToRetrieve = [...Array(memberCount.toNumber()).keys()]

        const functions = indexesToRetrieve.map(index => this.tokenInstance.findMemberByIndex(index))
        let results = await Promise.all(functions)

        // TODO: this code should be modular. it will be used a lot
        let users = []
        let totalTokens = 0;
        for (const [address, username, active, elected, balance, backing] of results) {
            totalTokens += balance.toNumber();
            const totalBacking = balance + backing
            users.push({ address, username, elected, balance, backing })
        }

        users.sort((a, b) => b.balance - a.balance)

        this.setState({ users, totalTokens })

    }

    render() {
        let users = this.state.users;

        const maxWidth = 500; // TODO this should not be in two places
        const threshold = 1000;
        const scale = maxWidth / this.state.totalTokens;
        const thresholdScaled = threshold * scale + 40; // TODO we shouldnt have the ul margin hardcoded here

        let userList = users.map(({ address, username, elected, balance, backing }) =>
            <MemberRow key={address} username={username} elected={elected} balance={balance} backing={backing} totalTokens={this.state.totalTokens} availableBalance={1000} />
        )

        return (
            <div>
                <h2>Current Members</h2>
                <div style={{ position: 'relative' }}>
                    <ul style={{ listStyle: 'none' }}>
                        {userList}
                        <div style={{ position: 'absolute', border: '1px dashed darkgray', height: '100%', width: '0px', top: '0', left: `${thresholdScaled}px` }} />
                    </ul>

                </div>
            </div>
        )
    }

}

export default App
