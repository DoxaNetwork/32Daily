import React, { Component } from 'react'

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
        this.tokenInstance = await getContract(this.state.token);
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

export default Search
