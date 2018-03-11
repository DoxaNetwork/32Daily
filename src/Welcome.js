import React, { Component } from 'react'
import Submit from './Submit'
import UserPosts from './UserPosts'
import { postLink } from './DappFunctions'

function Welcome(props){
    return (
        <div>
            <h1>
                Welcome Back, {props.user.username}!
            </h1>
            <p>Your address is {props.user.address}, and you have {props.user.balance.toNumber()} Doxa Tokens</p>
            <Submit onSubmit={postLink} />
            <UserPosts user={props.user} />
        </div>
    )
}

export default Welcome