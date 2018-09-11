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
        border: 1px solid var(--main-color);
        border-left: none;
        width: 150px;
        text-align:center;
        padding: 10px 0;
    }
    div:first-child {
        border-left: 1px solid var(--main-color);
    }

    div:hover {
        background-color:var(--main-color);
        color: white;
    }
    a {
        text-decoration: none;
        color:var(--main-color);
    }
`

export class FreqSelector extends Component {
    render() {
        return (
            <_FreqSelector>
                <NavLink activeClassName="active" className="doxa1link" to="/freq1/">
                    <div>10 minutes</div>
                </NavLink>
                <NavLink activeClassName="active" className="doxa1000link" to="/freq2/">
                    <div>100 minutes</div>
                </NavLink>
                <div>1,000 minutes</div>
                <div>10,000 minutes</div>
                <div>100,000 minutes</div>
            </_FreqSelector>
            )
    }
}