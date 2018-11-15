import React, { Component } from 'react'
import { Link, NavLink, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Media from 'react-media';

import { FaUserAstronaut } from "react-icons/fa";

import styled from 'styled-components';
import { Button } from './styledComponents'

import mainLogo from './public/Temporank_B2_KO.png';



const StyledHeader = styled.div`
    color: var(--white);
    font-size:24px;
    padding: 15px 20px 0 20px;
    background-color: var(--primary);
    margin:auto;
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
    padding-bottom: 10px;
    justify-content: flex-end;
    width: 150px;

    a {
        display: flex;
        text-decoration: none;
    }
`

const MainLogo = styled.img`
    width: 105px;
    margin: -35px;
    margin-left: -15px;
    margin-right:60px;
`

const Up = styled.span`
    color:#e0eaf8;
`
const Block = styled.span`
    color:#a8c4ec;
`
const Title = styled.div`
    font-family: 'Comfortaa', serif;
    position: absolute;
    left: 80px;
    top: 10px;
`

const FreqSelector = styled.div`
    display: flex;
    font-size: 0.8em;
    font-weight: 800;
    height: 47px;
    a {
        text-decoration: none;
        color: white;
        padding: 10px 15px;
        color: #a8c4ec;
        transition: all 150ms ease-in-out;
    }
    a:hover {
        color: white;
        border-bottom: 3px solid white;
    }

    .navLink-active {
        color: white;
        border-bottom: 3px solid white;
    }
`

const MobileFreqSelector = styled(FreqSelector)`
    background-color: var(--primary);
    justify-content: space-around;
    height: 39px;
    border-top: 1px solid #7da8e2;
`

class _Header extends Component {
    render() {
        let urlSecondPart;
        const urlFirstPart = this.props.location.pathname.split("/")[1];
        if (['hourly', 'semidaily', 'weekly'].includes(urlFirstPart)) {
            urlSecondPart = this.props.location.pathname.split("/")[2];
        } else {
            urlSecondPart = "submissions";
        }

        return (
            <Media query="(max-width: 649px)">
                    {mobile =>
                    <div>
                        <StyledHeader>
                            <Link to="/semidaily/">
                                <div>
                                    <MainLogo  src={mainLogo}/>
                                    <Title>
                                        <Up>up</Up><Block>block</Block>
                                    </Title>
                                </div>
                            </Link>
                            { mobile ? '' : (
                            <FreqSelector>
                                <NavLink activeClassName="navLink-active" to={"/hourly/" + urlSecondPart}><div>hourly</div></NavLink>
                                <NavLink activeClassName="navLink-active" to={"/semidaily/" + urlSecondPart}><div>semidaily</div></NavLink>
                                <NavLink activeClassName="navLink-active" to={"/weekly/" + urlSecondPart}><div>weekly</div></NavLink>
                            </FreqSelector>
                            ) }
                            <RightSideGroup>
                                <NavLink to='/hourly/create/'>
                                    <HeaderButton>New post</HeaderButton>
                                </NavLink>
                                {this.props.account && 
                                    <UserLink to={'/u/' + this.props.account}><FaUserAstronaut/></UserLink>
                                }
                            </RightSideGroup>
                        </StyledHeader>
                        { mobile ? (
                            <MobileFreqSelector>
                                <NavLink activeClassName="navLink-active" to={"/hourly/" + urlSecondPart}><div>hourly</div></NavLink>
                                <NavLink activeClassName="navLink-active" to={"/semidaily/" + urlSecondPart}><div>semidaily</div></NavLink>
                                <NavLink activeClassName="navLink-active" to={"/weekly/" + urlSecondPart}><div>weekly</div></NavLink>
                            </MobileFreqSelector>
                            ) : ''}
                    </div>
                    }
            </Media>
        )
    }
}

const mapStateToProps = state => ({
    account: state.account.account,
})

export const Header = withRouter(connect(
    mapStateToProps,
)(_Header))