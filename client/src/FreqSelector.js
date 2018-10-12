import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components';

const _FreqSelector = styled.div`
    display: flex;
    justify-content: center;
    background-color: var(--white);
    position: relative;

    div {
        text-align:center;
        padding: 10px 0;
    }
    .navLink-active div {
        background-color: var(--white) !important;
        color:var(--secondary) !important;
    }
    div:hover {
        background-color: var(--white) !important;
        color:var(--secondary) !important;
    }
    a {
        text-decoration: none;
        color:white;
        width: 33.4%;
        font-weight:800;
    }
`

export class FreqSelector extends Component {
    render() {
        return (
            <_FreqSelector>
                <NavLink activeClassName="navLink-active" to="/one/">
                    <div style={{'background-color': '#1D5FB5'}} className="first">hourly</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/ten/">
                    <div style={{'background-color': '#135196'}}>semidaily</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/hundred/">
                    <div style={{'background-color': '#0A4278'}}>weekly</div>
                </NavLink>
            </_FreqSelector>
            )
    }
}