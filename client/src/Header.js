import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { connect } from 'react-redux'

import { FaUserAstronaut } from "react-icons/fa";

import styled from 'styled-components';
import { Button } from './styledComponents'

const Title = styled.div`
    font-family: 'Comfortaa', serif;
`

const StyledHeader = styled.div`
    color: var(--white);
    font-size:24px;
    padding: 15px 20px 15px;
    /*background: linear-gradient(to bottom right, var(--primary) , #102898);*/
    background-color: var(--primary);
    margin:auto;
    /*text-align: center;*/
    align-items:center;
    display: flex;
    justify-content: space-between;
`
const UserLink = styled(Link)`
    color: white;
    transition: all 200ms ease-in;
    margin-left: 20px;
    &:hover {
        color:var(--secondary);
        transition: none;
    }
`

const HeaderButton = styled(Button)`
    width: unset;
    height: unset;
    padding: 5px 10px;
    border: 1px solid white;
    transition: all 200ms ease-in;
    font-size: 0.6em;

    &:hover {
        background-color: var(--secondary);
        transition: none;
        border: 1px solid var(--secondary);
    }
`
const RightSideGroup = styled.div`
    display: flex;
    align-items: center;

    a {
        display: flex;
        text-decoration: none;
    }
`
const Spacer = styled.div`
    visibility:hidden;

    @media only screen and (max-width: 649px) {
        display: none;
    }
`

class _Header extends Component {
    render() {
        return (
            <div>
                <StyledHeader>
                    <Spacer>
                        <RightSideGroup>
                        <NavLink activeClassName="navLink-active" to={`/one/create`}>
                            <HeaderButton>New post</HeaderButton>
                        </NavLink>
                        {this.props.account && 
                            <UserLink to={'/u/' + this.props.account}><FaUserAstronaut/></UserLink>
                        }
                    </RightSideGroup>
                    </Spacer>
                    <Title>upblocks</Title>
                    <RightSideGroup>
                        <NavLink activeClassName="navLink-active" to={`/one/create`}>
                            <HeaderButton>New post</HeaderButton>
                        </NavLink>
                        {this.props.account && 
                            <UserLink to={'/u/' + this.props.account}><FaUserAstronaut/></UserLink>
                        }
                    </RightSideGroup>
                </StyledHeader>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    account: state.account.account,
})

export const Header = connect(
    mapStateToProps,
)(_Header)