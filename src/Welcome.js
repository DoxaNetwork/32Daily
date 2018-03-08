import React, { Component } from 'react'

function Welcome(props){
    return (
        <div>
            <h1>
                Welcome Back, {props.user.username}!
            </h1>
            <p>You have {props.user.balance.toNumber()} TT, and you are backed by {props.user.backing.toNumber()} TT.</p>
            <p>Your address is {props.user.address}.</p>
        </div>
    )
}

export default Welcome