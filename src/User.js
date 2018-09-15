import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components';

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

    render() {
        return (
            <UserOuterContainer>
                <UserContainer>
                    <div className="row">
                        <div>user id</div>
                        <div className="row-value">{this.props.match.params.id.substring(0,6)}</div>
                    </div>
                    <div className="row">
                        <div>token balance</div>
                        <div className="row-value">todo</div>
                    </div>
                    <div className="row">
                        <div>available votes</div>
                        <div className="row-value">todo</div>
                    </div>
                    <div className="row">
                        <div>submitted posts</div>
                        <div className="row-value">todo</div>
                    </div>
                    <div className="row">
                        <div>published posts</div>
                        <div className="row-value">todo</div>
                    </div>
                    <Address>{this.props.match.params.id}</Address>
                </UserContainer>
            </UserOuterContainer>
        )
    }
}