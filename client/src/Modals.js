import React, { Component } from 'react'
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import {  FaWindowClose as Icon } from "react-icons/fa";

import ropstenGIF from './public/ropsten.gif';
import metamask from './public/download_metamask.png';


const ModalsContainer = styled.div`
    top: 0;
    position: absolute;
    padding: 100px;
    min-height:108vh;
    background-color: rgba(88,88,88,0.7);

    @media only screen and (max-width: 649px) {
        padding: 30% 10%;
    }
`
const ModalsContainer2 = styled.div`
    background-color:white;
    color:black;
    height:100%;
    box-sizing: border-box;
    border-radius: 5px;
    position:relative;
`

const Close = styled.a`
    font-size: 2.5em;
    color: var(--primary);
    position: absolute;
    right:0;
    margin: 20px;

    &:hover {
        cursor:pointer;
        color: var(--bright);
    }
`

const ModalsBody = styled.div`
    padding:40px 10%;
    text-align:center;

    img {
        max-width:100%;
        border-radius: 5px;
    }
`

const ModalHeader = styled.h1`
    
`

class _Modals extends Component {

    close() {
        const {dispatch} = this.props;
        dispatch({type: "CLEAR_MODAL"})
    }
    render() {
        const {modals} = this.props;

        let modal;
        if (modals.length) {
            switch (modals[0].id) {
                case 'ROPSTEN':
                    modal = <Ropsten/>
                    break;
                case 'WEB3':
                    modal = <Web3/>
                    break;
            }
        }

        return (
            <>
                {modals.length && 
                    <ModalsContainer>
                        <ModalsContainer2>
                            <Close onClick={() => this.close()}><Icon/></Close>
                            {modal}
                        </ModalsContainer2>                
                    </ModalsContainer>
                }
            </>
        )
    }
}

const Metamask = styled.img`
    width: 250px;
    max-width: 100%;
    margin: 40px 0;
`

class Web3 extends Component {
    render() {
        return (
            <ModalsBody>
                <ModalHeader>
                    Hey there, you're gonna need a browser that supports web3
                </ModalHeader>
                <a href="http://metamask.io"><Metamask src={metamask}/></a>
            </ModalsBody>
        )
    }
}

class Ropsten extends Component {
    render() {
        return (
            <ModalsBody>
                <ModalHeader>
                    Hey there, you've got to switch to the Ropsten Test Network
                </ModalHeader>
                <img src={ropstenGIF}/>
            </ModalsBody>
        )
    }
}

const mapStateToProps = state => ({
    modals: state.modals,
})

export const Modals = connect(
    mapStateToProps
)(_Modals)