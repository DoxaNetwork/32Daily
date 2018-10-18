import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';

import identicon from 'identicon.js'
import Img from 'react-image'


import contract from 'truffle-contract'

import { Button } from './styledComponents'
import MemberRegistryContract from './contracts/MemberRegistry.json'
import DoxaHubContract from './contracts/DoxaHub.json'
import HigherFreqContract from './contracts/HigherFreq.json'
import Freq3Contract from './contracts/Freq3.json'
import { getContract, getCurrentAccount } from './DappFunctions'

import {fileFromIPFS, fileToIPFS, postToIPFS, contentFromIPFS32} from './utils/ipfs' 

import {toAscii} from './utils/helpers'

const doxaHubContract = contract(DoxaHubContract)
const memberRegistryContract = contract(MemberRegistryContract)
const higherFreqContract = contract(HigherFreqContract)
const freq3Contract = contract(Freq3Contract)


const Identity = styled(Img)`
    width:75px;
    height:75px;
    border-radius:75px;
    border: 5px solid var(--white);
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

        const src = this.props.imageUrl ? this.props.imageUrl : "data:image/png;base64," + data.toString();

        return (
            <Identity width="75" height="75" src={src}/>
        )
    }
}

const UserContainer = styled.div`
    background-color: var(--white);
    max-width: 450px;
    margin: 50px auto;
    overflow:hidden;
    margin-top: 50px;
    border-radius: 8px;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16), 0 0 0 0 rgba(0,0,0,0.12);
    font-size: 1.2em;
`

const UserOuterContainer = styled.div`
    min-height:70vh;
`

const ChainMetadata = styled.div`
    display: flex;
    justify-content: space-around;
    padding: 50px 20px;
`

const EditableMetadata = styled.div`
    border-bottom: 1px solid var(--lightgray);
    padding: 50px 20px;

    div {
        margin: 20px 0;
        font-size: 1em;
    }

    textarea {
        width: 100%;
        height: 100px;
        resize: none;
        border: 1px solid var(--lightgray);
        border-radius: 3px;
        box-sizing: border-box;
        padding: 10px;
        font-size: 1em;
    }

    input {
        border-radius: 3px;
        border: 1px solid var(--lightgray);
        padding: 10px;
        width: 100%;
        box-sizing: border-box;
        font-size: 1em;
    }
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

    label:hover {
        cursor: pointer;
    }
`
const ButtonContainer = styled.div`
    text-align:center;
`

export class _User extends Component {
    state = {
        postsPublished1: '...',
        postsPublished2: '...',
        postsPublished3: '...',
        userLoggedIn: false,
        registered: false,
        newUsername: '',
        newProfile: '',
        newImageUrl: null,
        newImageIPFS: null,
    }

    async componentDidMount() {
        this.props.dispatch({type: "LOAD_USER_IF_NEEDED", address: this.props.match.params.id})

        const doxaHub = await getContract(doxaHubContract);
        const freq3 = await getContract(freq3Contract);
        const higherFreq = await getContract(higherFreqContract);

        const currentAccount = await getCurrentAccount();
        this.setState({userLoggedIn: this.props.match.params.id === currentAccount})

        // get karma
        const filter1 = doxaHub.Published({poster: this.props.match.params.id}, {fromBlock: 0})
        const filterPromise1 = () => {
            return new Promise((resolve, reject) => {
                filter1.get( (e, r) => {
                    resolve(r)
                })
            })
        }
        const filter2 = higherFreq.Published({poster: this.props.match.params.id}, {fromBlock: 0})
        const filterPromise2 = () => {
            return new Promise((resolve, reject) => {
                filter2.get( (e, r) => {
                    resolve(r)
                })
            })
        }
        const filter3 = freq3.Published({poster: this.props.match.params.id}, {fromBlock: 0})
        const filterPromise3 = () => {
            return new Promise((resolve, reject) => {
                filter3.get( (e, r) => {
                    resolve(r)
                })
            })
        }

        const results1 = await filterPromise1();
        const results2 = await filterPromise2();
        const results3 = await filterPromise3();
        this.setState({postsPublished1: results1.length});
        this.setState({postsPublished2: results2.length});
        this.setState({postsPublished3: results3.length});
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
            const newImageUrl = await this.urlFromHash(pictureHash);
            this.setState({newImageUrl, newImageIPFS: pictureHash})
        }
        reader.readAsArrayBuffer(file)
      }

    async submit() {
        const {registered, newUsername, newProfile, newImageIPFS} = this.state;
        const {dispatch} = this.props;

        if (registered) {
            dispatch({type: "UPDATE_USER", profile: newProfile, imageIPFS: newImageIPFS})
        } else {
            dispatch({type: "REGISTER_USER", username: newUsername, profile: newProfile, imageIPFS: newImageIPFS})
        }
    }

    handleContentChange(e) {
        const id = e.target.id;
        const value = e.target.value;
        this.setState({ [id]: value });
    }

    render() {
        const {account, users} = this.props;

        if (!users) {
            return ("loading")
        }
        const user = users[account] || {};

        const editableMetadata = this.state.userLoggedIn ? (
            <>
            <IdenticonContainer>
                <label htmlFor="imageUpload">
                    <Identicon poster={this.props.match.params.id} imageUrl={user.picture || this.state.imageUrl}/>
                </label>
                <input type='file' id='imageUpload' onChange={(e) => this.imageUpload(e)}/>
            </IdenticonContainer>
            <EditableMetadata>
                <div>
                    <input 
                        value={this.state.newUsername} 
                        placeholder="what should we call you?" 
                        type="text" 
                        id="newUsername"
                        onChange={(e) => this.handleContentChange(e)}></input>
                </div>
                <div>
                    <textarea 
                        value={this.state.newProfile} 
                        placeholder="what should we know about you?" 
                        id="newProfile"
                        onChange={(e) => this.handleContentChange(e)}></textarea>
                </div>
                <ButtonContainer>
                    <Button onClick={() => this.submit()}>Save</Button>
                </ButtonContainer>
            </EditableMetadata>
            </>
        ) : (
            <>
            <IdenticonContainer>
                    <Identicon poster={this.props.match.params.id} imageUrl={user.picture}/>
            </IdenticonContainer>
            <EditableMetadata>
                <Bold>{user.username || "nothing here yet"}</Bold>
                <div>{user.profile || "nothing here yet"}</div>
            </EditableMetadata>
            </>
        );
        return (
            <UserOuterContainer>
                <UserContainer>
                    {editableMetadata}
                     <ChainMetadata>
                        <div>
                            <Bold>User id</Bold>
                            <div>{this.props.match.params.id.substring(0,6)}</div>
                        </div>
                        <div>
                            <Bold>Karma1</Bold>
                            <div>{this.state.postsPublished1}</div>
                        </div>
                         <div>
                            <Bold>Karma2</Bold>
                            <div>{this.state.postsPublished2}</div>
                        </div>
                         <div>
                            <Bold>Karma3</Bold>
                            <div>{this.state.postsPublished3}</div>
                        </div>
                    </ChainMetadata>
                </UserContainer>
            </UserOuterContainer>
        )
    }
}

const mapStateToProps = state => ({
    account: state.user.account, // have got to initialize this somewhere
    users: state.users
})

export const User = connect(
    mapStateToProps,
)(_User)