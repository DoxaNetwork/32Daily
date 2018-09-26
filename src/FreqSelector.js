import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components';

const _FreqSelector = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px 50px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0,0,0,.14);
    position: relative;

    div {
        border: 1px solid var(--primary);
        border-left: none;
        width: 150px;
        text-align:center;
        padding: 10px 0;
    }
    .first {
        border-left: 1px solid var(--primary);
        
    }
    div:hover {
        background-color:var(--primary);
        color: white;
    }
    a {
        text-decoration: none;
        color:var(--primary);
    }
`

export class FreqSelector extends Component {
    render() {
        return (
            <_FreqSelector>
                <NavLink activeClassName="navLink-active" to="/one/create">
                    <div className="first">Create Post</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/one/">
                    <div>1 hour</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/ten/">
                    <div>10 hours</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/hundred/">
                    <div>100 hours</div>
                </NavLink>
            </_FreqSelector>
            )
    }
}