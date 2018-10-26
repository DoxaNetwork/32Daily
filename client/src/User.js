import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';

import identicon from 'identicon.js'
import Img from 'react-image'
import { Button } from './styledComponents'

import {fileFromIPFS, fileToIPFS } from './utils/ipfs' 


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
    border-radius: 8px;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16), 0 0 0 0 rgba(0,0,0,0.12);
    font-size: 1.2em;

    @media only screen and (max-width: 649px) {
        left: 230px;
        margin: 50px 20px 0;
    }
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
    padding-top: 30px;
`
const Clear = styled(Button)`
    background-color:white;
    color:var(--primary);
    border: 1px solid var(--primary);
    margin-left: 20px;

    &:hover{
        color:white;
        background-color:var(--secondary);
        border: 1px solid var(--secondary);
    }
`

const TokenContainer = styled.div`
    position: relative;
    color: white;
    top: -50px;
    left: 300px;
    display: flex;

    @media only screen and (max-width: 649px) {
        left: 230px;
    }
`

const Address = styled.div`
    font-size:0.8em;
    @media only screen and (max-width: 649px) {
        font-size: 0.7em;
    }
`
const AddressLabel = styled.div`
    font-weight:800;
    text-align:center;
`

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export class _User extends Component {
    state = {
        registered: false,
        newUsername: '',
        newProfile: '',
        newImageUrl: null,
        newImageIPFS: null,
        edit: false
    }

    componentDidMount() {
        const {dispatch, match} = this.props;
        dispatch({type: "LOAD_USER_IF_NEEDED", address: match.params.id})
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

    submit() {
        const {registered, newUsername, newProfile, newImageIPFS} = this.state;
        const {dispatch} = this.props;

        if (registered) {
            dispatch({type: "UPDATE_USER", profile: newProfile, imageIPFS: newImageIPFS})
        } else {
            dispatch({type: "REGISTER_USER", username: newUsername, profile: newProfile, imageIPFS: newImageIPFS})
        }
    }

    clear() {
        this.setState({ edit: false,
                        newUsername: '',
                        newProfile: '',
                        newImageUrl: null,
                        newImageIPFS: null,
                        edit: false  });
    }


    handleContentChange(e) {
        const id = e.target.id;
        const value = e.target.value;
        this.setState({ [id]: value });
    }

    render() {
        const {users, match, account} = this.props;

        if (!users) {
            return ("loading")
        }
        const user = users[match.params.id] || {};
        const userLoggedIn = match.params.id == account;

        const editableMetadata = userLoggedIn && this.state.edit ? (
            <>
            <IdenticonContainer>
                <label htmlFor="imageUpload">
                    <Identicon poster={match.params.id} imageUrl={this.state.newImageUrl || user.picture}/>
                </label>
                <input type='file' id='imageUpload' onChange={(e) => this.imageUpload(e)}/>
                <TokenContainer>
                    <div>{user.tokenBalance && numberWithCommas(user.tokenBalance)}</div><Bold> Ups</Bold>
                </TokenContainer>
            </IdenticonContainer>
            <EditableMetadata>
                {user.username ? (
                    <Bold>{user.username}</Bold>
                    ) : (
                    <div>
                        <input 
                            value={this.state.newUsername} 
                            placeholder="what should we call you?" 
                            type="text" 
                            id="newUsername"
                            onChange={(e) => this.handleContentChange(e)}></input>
                    </div>
                    )}
                <div>
                    <textarea 
                        value={this.state.newProfile} 
                        placeholder="what should we know about you?" 
                        id="newProfile"
                        onChange={(e) => this.handleContentChange(e)}></textarea>
                </div>
                <ButtonContainer>
                    <Button onClick={() => this.submit()}>Save</Button>
                    <Clear onClick={() => this.clear()}>Clear</Clear>
                </ButtonContainer>
            </EditableMetadata>
            </>
        ) : (
            <>
            <IdenticonContainer>
                    <Identicon poster={match.params.id} imageUrl={user.picture}/>
                    <TokenContainer>
                    <div>{user.tokenBalance && numberWithCommas(user.tokenBalance)}</div><Bold> Ups</Bold>
                </TokenContainer>
            </IdenticonContainer>
            <EditableMetadata>
                <Bold>{user.username || "unregistered"}</Bold>
                <div>{user.profile || "nothing here yet"}</div>
                {userLoggedIn && !this.state.edit &&
                    <ButtonContainer>
                        <Button onClick={() => this.setState({edit:true})}>Edit</Button>
                    </ButtonContainer>
                }
            </EditableMetadata>
            </>
        );
        return (
            <UserOuterContainer>
                <UserContainer>
                    {editableMetadata}
                    
                     <ChainMetadata>
                        <div>
                            <AddressLabel>Account address</AddressLabel>
                            <Address>{match.params.id}</Address>
                        </div>
                    </ChainMetadata>
                </UserContainer>
            </UserOuterContainer>
        )
    }
}

const mapStateToProps = state => ({
    account: state.account.account,
    users: state.users
})

export const User = connect(
    mapStateToProps,
)(_User)