import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';

import identicon from 'identicon.js'
import Img from 'react-image'


import contract from 'truffle-contract'

import { Button } from './styledComponents'
import MemberRegistryContract from './contracts/MemberRegistry.json'
import DoxaHubContract from './contracts/DoxaHub.json'
import { getContract, getCurrentAccount } from './DappFunctions'

import {fileFromIPFS, fileToIPFS, postToIPFS, contentFromIPFS32} from './utils/ipfs' 

import {toAscii} from './utils/helpers'

const doxaHubContract = contract(DoxaHubContract)
const memberRegistryContract = contract(MemberRegistryContract)



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
`
const ButtonContainer = styled.div`
    text-align:center;
`

export class _User extends Component {
    state = {
        postsPublished: '...',
        userLoggedIn: false,
        imageUrl: null,
        username: '...',
        profile: '...',
        imageIPFS: null,
        registered: false,
    }

    async componentDidMount() {
        const doxaHub = await getContract(doxaHubContract);
        const filter = doxaHub.Published({poster: this.props.match.params.id}, {fromBlock: 0})

        const registry = await getContract(memberRegistryContract);
        const currentAccount = await getCurrentAccount();

        let [owner, name, profileIPFS, exiled] = await registry.get(this.props.match.params.id);
        name = toAscii(name)

        if (name !== '') {
            console.log('user already registered, pulling from ipfs')
            let profile = await contentFromIPFS32(profileIPFS);
            profile = JSON.parse(profile)
            console.log(profile)

            const pictureHash = profile['image'];

            if (pictureHash !== null) {
                const imageUrl = await this.urlFromHash(pictureHash);
                this.setState({imageUrl, imageIPFS: pictureHash})
            }

            this.setState({registered: true, username:name, profile: profile['profile']})
            
        } else {
            console.log('user not yet registered')
        }

        const filterPromise = () => {
            return new Promise((resolve, reject) => {
                filter.get( (e, r) => {
                    resolve(r)
                })
            })
        }

        const results = await filterPromise();
        this.setState({postsPublished: results.length});
        this.setState({userLoggedIn: this.props.match.params.id === currentAccount})
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
            this.setState({imageUrl, imageIPFS: pictureHash})
        }
        reader.readAsArrayBuffer(file)
      }

    async submit() {
        const registry = await getContract(memberRegistryContract);
        const currentAccount = await getCurrentAccount();

        const {username, profile, imageIPFS} = this.state;
        const ipfsblob = {profile, image: imageIPFS}
        const ipfsPathShort = await postToIPFS(JSON.stringify(ipfsblob));

        if (this.state.registered) {
            console.debug('updating user')
            await registry.setProfile(ipfsPathShort, { from: currentAccount})
        } else {
            console.debug('registering user')
            await registry.create(username, ipfsPathShort, { from: currentAccount})
        }
    }

    handleContentChange(e) {
        const id = e.target.id;
        const value = e.target.value;
        this.setState({ [id]: value });
    }

    render() {
        const editableMetadata = this.state.userLoggedIn ? (
            <EditableMetadata>
                <div>
                    <input 
                        value={this.state.username} 
                        placeholder="what should we call you?" 
                        type="text" 
                        id="username"
                        onChange={(e) => this.handleContentChange(e)}></input>
                </div>
                <div>
                    <textarea 
                        value={this.state.profile} 
                        placeholder="what should we know about you?" 
                        id="profile"
                        onChange={(e) => this.handleContentChange(e)}></textarea>
                </div>
                <ButtonContainer>
                    <Button onClick={() => this.submit()}>Save</Button>
                </ButtonContainer>
            </EditableMetadata>
            ) : (
            <EditableMetadata>
                <Bold>{this.state.username}</Bold>
                <div>{this.state.profile}</div>
            </EditableMetadata>

            );
        return (
            <UserOuterContainer>
                <UserContainer>
                    <IdenticonContainer>
                        <label htmlFor="imageUpload">
                            <Identicon poster={this.props.match.params.id} imageUrl={this.state.imageUrl}/>
                        </label>
                        <input type='file' id='imageUpload' onChange={(e) => this.imageUpload(e)}/>
                    </IdenticonContainer>
                    {editableMetadata}
                     <ChainMetadata>
                        <div>
                            <Bold>User id</Bold>
                            <div>{this.props.match.params.id.substring(0,6)}</div>
                        </div>
                        <div>
                            <Bold>Karma</Bold>
                            <div>{this.state.postsPublished}</div>
                        </div>
                    </ChainMetadata>
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