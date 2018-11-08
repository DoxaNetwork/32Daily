import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';
import Blockies from 'react-blockies';

import Img from 'react-image'
import { Button } from './styledComponents'

import {fileFromIPFS, fileToIPFS } from './utils/ipfs' 


const Identity = styled.div`
    margin-right: 10px;

    img {
        width:72px;
        height:72px;
        border-radius:50px;
        position: relative;
        top: 25px;
        border: 5px  solid var(--white);

        @media only screen and (max-width: 649px) {
            width:40px;
            height:40px;
        }
    }

    canvas {
        border-radius: 100px;
        border: 5px solid var(--white);
        position: relative;
        top: 25px;
    }
`

class Identicon extends Component {

    render() {
        return (
            <Identity>
                {this.props.src ? (
                    <img src={this.props.src}/>
                ) : (
                    <Blockies
                      seed={this.props.poster} /* the only required prop; determines how the image is generated */
                      size={8} /* number of squares wide/tall the image will be; default = 15 */
                      scale={9} /* width/height of each square in pixels; default = 4 */
                    />
                ) }
            </Identity>
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
  return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
}

export class _User extends Component {
    state = {
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
        const {newUsername, newProfile, newImageIPFS} = this.state;
        const {dispatch, users, match} = this.props;

        const user = users[match.params.id] || {};
        const registered = Boolean(user.username);

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
        const registered = Boolean(user.username);

        const editableMetadata = userLoggedIn && this.state.edit ? (
            <>
            <IdenticonContainer>
                <label htmlFor="imageUpload">
                    <Identicon poster={match.params.id} src={this.state.newImageUrl || user.picture}/>
                </label>
                <input type='file' id='imageUpload' onChange={(e) => this.imageUpload(e)}/>
                <TokenContainer>
                    <div>{numberWithCommas(user.tokenBalance)}</div><Bold>&nbsp;credits</Bold>
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
                    <Identicon poster={match.params.id} src={user.picture}/>
                    <TokenContainer>
                    <div>{numberWithCommas(user.tokenBalance)}</div><Bold>&nbsp;credits</Bold>
                </TokenContainer>
            </IdenticonContainer>
            <EditableMetadata>
                <Bold>{user.username || "unregistered"}</Bold>
                <div>{user.profile || "nothing here yet"}</div>
                {userLoggedIn && !this.state.edit && registered &&
                    <ButtonContainer>
                        <Button onClick={() => this.setState({edit:true})}>Edit</Button>
                    </ButtonContainer>
                }
                {userLoggedIn && !this.state.edit  && !registered &&
                    <ButtonContainer>
                        <Button onClick={() => this.setState({edit:true})}>Register</Button>
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