import React, { Component } from 'react'
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import {  FaWindowClose   as Icon } from "react-icons/fa";

import ropstenGIF from './public/ropsten.gif';


const ModalsContainer = styled.div`
    top: 0;
    position: absolute;
    padding: 100px;
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

    a {
        font-size: 2.5em;
        color: var(--primary);
        position: absolute;
        right:0;
        margin: 20px;

        &:hover {
            cursor:pointer;
            color: var(--bright);
        }
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
                default:
                    modal = <Generic {...modals[0]}/>
            }
        }

        return (
            <>
                {modals.length && 
                    <ModalsContainer>
                        <ModalsContainer2>
                            <a onClick={() => this.close()}><Icon/></a>
                            {modal}
                        </ModalsContainer2>                
                    </ModalsContainer>
                }
            </>
        )
    }
}

class Generic extends Component {
    render() {
        return (
            <ModalsBody>
                <ModalHeader>
                    {this.props.header}
                </ModalHeader>
                {this.props.message}
            </ModalsBody>
        )
    }
}

class Ropsten extends Component {
    render() {
        return (
            <ModalsBody>
                <ModalHeader>
                    Hey there, you've got to switch to the Ropsten test network
                </ModalHeader>
                <img src={ropstenGIF}/>
            </ModalsBody>
        )
    }
}

const mapStateToProps = state => ({
    modals: state.modals, // have got to initialize this somewhere
})

export const Modals = connect(
    mapStateToProps
)(_Modals)