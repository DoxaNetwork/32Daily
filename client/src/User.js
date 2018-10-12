import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';
import identicon from 'identicon.js'
import Img from 'react-image'


import contract from 'truffle-contract'

import DoxaHubContract from './contracts/DoxaHub.json'
import { getContract } from './DappFunctions'
import {fileFromIPFS, fileToIPFS} from './utils/ipfs' 

const doxaHubContract = contract(DoxaHubContract)


const Identity = styled(Img)`
    width:75px;
    height:75px;
    border-radius:75px;
    border: 5px solid var(--white);
    top: 25px;
    position: relative;

    &:hover {
        cursor: pointer;
    }
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

        const src = this.props.imageUrl ? this.props.imageUrl : "data:image/png;base64," + data.toString();

        return (
            <Identity width="75" height="75" src={src}/>
        )
    }
}

const UserContainer = styled.div`
    background-color: var(--white);
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

    input {
        display:none;
    }
`

export class _User extends Component {
    state = {
        postsPublished: '...',
        userLoggedIn: false,
        imageUrl: null
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
        this.setState({userLoggedIn: this.props.match.params.id === this.props.account})

        // need to either 
        // - get this from ethereum and reset it everytime we change (worse)
        // - get this from ethereum as an IPNS hash and update without posting to ethereum
        const pictureHash = 'QmYBhMmzYvZRhtUL4dE1Vs6iwMusBWhL8nmRYbKvg2e1cY';
        const imageUrl = await this.urlFromHash(pictureHash);
        this.setState({imageUrl})   
    }

    async urlFromHash(hash) {
        const picture = await fileFromIPFS(hash);
        const blob = new Blob( [ picture ], { type: "image/jpeg" } );
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL( blob );
        return imageUrl;
    }

    imageUpload (event) {
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.onloadend = async () => {
            const pictureHash = await fileToIPFS(reader.result);
            const imageUrl = await this.urlFromHash(pictureHash);
            this.setState({imageUrl})
        }
        reader.readAsArrayBuffer(file)
      }

    render() {
        return (
            <UserOuterContainer>
                <UserContainer>
                    <IdenticonContainer>
                        <label htmlFor="imageUpload">
                            <Identicon poster={this.props.match.params.id} imageUrl={this.state.imageUrl}/>
                        </label>
                        <input type='file' id='imageUpload' onChange={(e) => this.imageUpload(e)}/>
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

const mapStateToProps = state => ({
    account: state.user.account, // have got to initialize this somewhere
})

export const User = connect(
    mapStateToProps,
)(_User)