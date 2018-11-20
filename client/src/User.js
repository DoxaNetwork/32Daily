import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, NavLink, withRouter } from 'react-router-dom'

import styled, { css } from 'styled-components';
import Blockies from 'react-blockies';
import { FaChevronLeft } from "react-icons/fa";
import Img from 'react-image'
import { Button, Back } from './styledComponents'

import {fileFromIPFS, fileToIPFS } from './utils/ipfs' 
import { ClimbingBoxLoader } from 'react-spinners';
import pluralize from 'pluralize';



const Identity = styled.div`
    margin-right: 10px;

    img {
        width:72px;
        height:72px;
        border-radius:50px;
        position: relative;
        top: 25px;
        border: 5px  solid var(--white);
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
    overflow:hidden;
    border-radius: 5px;
    font-size: 1.2em;
`

const UserOuterContainer = styled.div`
    min-height:100vh;
    background-color:#fafafa;
` 

const UserInnerContainer = styled.div`
    max-width: 450px;
    margin: 0 auto;
    padding: 50px 20px;
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
    float: right;
    right: 60px;
    display: flex;

    @media only screen and (max-width: 649px) {
        right:30px;
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

const override = css`
    margin: 20px auto;
`

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

    submit(e) {
        const {newUsername, newProfile, newImageIPFS} = this.state;
        if (newUsername == '') return;
        const {dispatch, users, match} = this.props;

        const user = users[match.params.id] || {};
        const registered = Boolean(user.username);

        if (registered) {
            dispatch({type: "UPDATE_USER", profile: newProfile, imageIPFS: newImageIPFS})
        } else {
            dispatch({type: "REGISTER_USER", username: newUsername, profile: newProfile, imageIPFS: newImageIPFS})
        }
        e.preventDefault();
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
        const userLoaded = Boolean(users[match.params.id]);
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
                    <div>{numberWithCommas(user.tokenBalance)}</div><Bold>&nbsp;{pluralize('credit', user.tokenBalance)}</Bold>
                </TokenContainer>
            </IdenticonContainer>
            <EditableMetadata>
                <form name="userForm">
                    {user.username ? (
                        <Bold>{user.username}</Bold>
                        ) : (
                        <div>
                            <input 
                                value={this.state.newUsername} 
                                placeholder="what should we call you?" 
                                type="text" 
                                pattern=".{1,}"
                                required
                                title="Must be at least one character"
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
                        <Button type="submit" onClick={(e) => this.submit(e)}>Save</Button>
                        <Clear onClick={() => this.clear()}>Clear</Clear>
                    </ButtonContainer>
                </form>
            </EditableMetadata>
            </>
        ) : (
            <>
            <IdenticonContainer>
                    <Identicon poster={match.params.id} src={user.picture}/>
                    <TokenContainer>
                    <div>{numberWithCommas(user.tokenBalance)}</div><Bold>&nbsp;{pluralize('credit', user.tokenBalance)}</Bold>
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
                <UserInnerContainer>
                <Back>
                    <a onClick={this.props.history.goBack}><FaChevronLeft/> Back</a>
                </Back>
                <UserContainer>
                    {userLoaded && 
                        <>
                        {editableMetadata}
                        </>
                    }
                    <ClimbingBoxLoader
                      className={override}
                      color={'#266DD3'}
                      loading={!userLoaded}
                    />
                    
                     <ChainMetadata>
                        <div>
                            <AddressLabel>Account address</AddressLabel>
                            <Address>{match.params.id}</Address>
                        </div>
                    </ChainMetadata>
                </UserContainer>
                </UserInnerContainer>
            </UserOuterContainer>
        )
    }
}

const mapStateToProps = state => ({
    account: state.account.account,
    users: state.users
})

export const User = withRouter(connect(
    mapStateToProps,
)(_User))