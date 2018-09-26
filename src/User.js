import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';

import { loadUser } from './actions'

import contract from 'truffle-contract'

import DoxaHubContract from '../build/contracts/DoxaHub.json'
const doxaHubContract = contract(DoxaHubContract)

import { getContract } from './DappFunctions'

const UserContainer = styled.div`
    background-color: white;
    width: 450px;
    margin: auto;
    padding: 50px 50px 30px;
    margin-top: 50px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    font-size: 1.2em;

    .row {
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        padding: 0 5px;
    }

    .row-value {
        font-weight: 800;
    }
`
const Address = styled.div`
    text-align: center;
    margin-top: 30px;
`
const UserOuterContainer = styled.div`
    min-height:70vh;
`

export class User extends Component {
    state = {
        postsPublished: '...'
    }

    async componentDidMount() {
        // this.props.load(this.props.match.params.id)
        const doxaHub = await getContract(doxaHubContract);

        const filter = doxaHub.Published({poster: this.props.match.params.id}, {fromBlock: 0})

        const filterPromise = () => {
            return new Promise((resolve, reject) => {
                filter.get( (e, r) => {
                    resolve(r)
                })
            })
        }

        const results = await filterPromise();
        this.setState({postsPublished: results.length});
    }

    render() {
        return (
            <UserOuterContainer>
                <UserContainer>
                    <div className="row">
                        <div>User id</div>
                        <div className="row-value">{this.props.match.params.id.substring(0,6)}</div>
                    </div>
                    <div className="row">
                        <div>Posts published</div>
                        <div className="row-value">{this.state.postsPublished}</div>
                    </div>
                    <Address>{this.props.match.params.id}</Address>
                </UserContainer>
            </UserOuterContainer>
        )
    }
}

// 
// const mapDispatchToProps = dispatch => ({
//     load: userId => dispatch(loadUser(userId))
// })
// 
// export const User = connect(
//     null,
//     mapDispatchToProps
// )(_User)