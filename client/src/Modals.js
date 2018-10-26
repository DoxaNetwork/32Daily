import React, { Component } from 'react'
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import {  FaWindowClose   as Icon } from "react-icons/fa";


const ModalsContainer = styled.div`
    top: 0;
    position: fixed;
    height: 100%;
    width: 100%;
    padding: 15% 10%;
    box-sizing: border-box;
    background-color: rgba(4,53,88,0.7);

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
    padding:70px 10%;
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
        const modalMessage = modals[0] ? modals[0].message : '';
        const modalHeader = modals[0] ? modals[0].header : '';

        return (
            <>
                {modalMessage && 
                    <ModalsContainer>
                        <ModalsContainer2>
                            <a onClick={() => this.close()}><Icon/></a>
                            <ModalsBody>
                                <ModalHeader>
                                    {modalHeader}
                                </ModalHeader>
                                {modalMessage}
                            </ModalsBody>
                        </ModalsContainer2>                
                    </ModalsContainer>
                }
            </>
        )
    }
}

const mapStateToProps = state => ({
    modals: state.modals, // have got to initialize this somewhere
})

export const Modals = connect(
    mapStateToProps
)(_Modals)