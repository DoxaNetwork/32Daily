import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';
import identicon from 'identicon.js'

import contract from 'truffle-contract'

import DoxaHubContract from '../build/contracts/DoxaHub.json'
const doxaHubContract = contract(DoxaHubContract)

import { getContract } from './DappFunctions'

const Identity = styled.img`
    width:75px;
    height:75px;
    border-radius:75px;
    border: 5px solid white;
    top: 25px;
    position: relative;
`

class Identicon extends Component {
    options = {
      // foreground: [0, 0, 0, 255],               // rgba black
      // background: [255, 255, 255, 255],         // rgba white
      margin: 0.2,                              // 20% margin
      size: 420,                                // 420px square
      format: 'png'                             // could use SVG instead of PNG
    };

    render() {
        const data = new identicon(this.props.poster, this.options);
        const src = "data:image/png;base64," + data.toString();
        return (
            <Identity width="75" height="75" src={src}/>
        )
    }
}

const UserContainer = styled.div`
    background-color: white;
    width: 450px;
    margin: auto;
    overflow:hidden;
    margin-top: 50px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    font-size: 1.2em;
`

const UserOuterContainer = styled.div`
    min-height:70vh;
`

const Container1 = styled.div`
    display: flex;
    justify-content: space-around;
    padding: 50px 20px;
`
const Bold = styled.div`
    font-weight:800;
`

const IdenticonContainer = styled.div`
    text-align:center;
    background-color:var(--primary);
    height:75px;
`

export class User extends Component {
    state = {
        postsPublished: '...'
    }

    async componentDidMount() {
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
                    <IdenticonContainer>
                        <Identicon poster={this.props.match.params.id}/>
                    </IdenticonContainer>
                    <Container1>
                        <div>
                            <Bold>User id</Bold>
                            <div>{this.props.match.params.id.substring(0,6)}</div>
                        </div>
                        <div>
                            <Bold>Karma</Bold>
                            <div>{this.state.postsPublished}</div>
                        </div>
                    </Container1>
                </UserContainer>
            </UserOuterContainer>
        )
    }
}