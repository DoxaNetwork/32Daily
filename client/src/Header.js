import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { FaUserAstronaut } from "react-icons/fa";

import styled from 'styled-components';

const Title = styled.div`
    font-family: 'Comfortaa', serif;
`

const SubTitle = styled.div`
    margin-top: 20px;
    font-size: 0.3em;
`

const StyledHeader = styled.div`
    color: var(--white);
    font-size:24px;
    padding: 15px 20px 10px;
    /*background: linear-gradient(to bottom right, var(--primary) , #102898);*/
    background-color: var(--primary);
    margin:auto;
    /*text-align: center;*/
    display: flex;
    justify-content: space-between;
`
const UserLink = styled(Link)`
    color: white;
    &:hover {
        color:var(--bright);
    }
`

class _Header extends Component {
    render() {
        return (
            <div>
                <StyledHeader>
                    <div></div>
                    <Title>temporank</Title>
                    <UserLink to={'/u/' + this.props.account}><FaUserAstronaut/></UserLink>
                    {/* <SubTitle>Tiny curated message selected every {this.props.period}</SubTitle> */}
                </StyledHeader>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    account: state.user.account,
})

export const Header = connect(
    mapStateToProps,
)(_Header)