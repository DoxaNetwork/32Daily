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
                <NavLink activeClassName="navLink-active" to="/freq1/create">
                    <div className="first">Create Post</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/freq1/">
                    <div>10 minutes</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/freq2/">
                    <div>100 minutes</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/freq3/">
                    <div>1000 minutes</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/freq4/">
                    <div>10000 minutes</div>
                </NavLink>
                <NavLink activeClassName="navLink-active" to="/freq5/">
                    <div>10000 minutes</div>
                </NavLink>
            </_FreqSelector>
            )
    }
}