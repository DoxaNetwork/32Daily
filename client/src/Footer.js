import React, { Component } from 'react'
import styled from 'styled-components';
import { Link } from 'react-router-dom'

const FooterContainer = styled.div`
    display: flex;
    background-color:var(--secondary);
    padding:40px 50px 70px;
    color:var(--white);
` 
const FooterCol = styled.div`
    width:150px;
`
const FooterTitle = styled.h4`
    margin-bottom: 10px;
`
const FooterRow = styled.div`
    a {
       display:block;
       color: var(--lightgray);
       text-decoration: none;
       &:hover {
           color: var(--bright);
       } 
    }   
`

export class Footer extends Component {
    render() {
        return (
            <FooterContainer>
                <FooterCol>
                    <FooterTitle>
                         About
                    </FooterTitle>
                    <FooterRow><Link to="/faq">FAQ</Link></FooterRow>
                    <FooterRow><a href="https://medium.com/the-doxa-blog">Blog</a></FooterRow>
                </FooterCol>
                <FooterCol>
                    <FooterTitle>
                        Contact
                    </FooterTitle>
                    <FooterRow><a href="https://discordapp.com/invite/2Qb9R7p">Discord</a></FooterRow>
                    <FooterRow><a href="mailto:hello@doxa.network">Email us</a></FooterRow>
                </FooterCol>
                <FooterCol>
                    <FooterTitle>
                         Company
                    </FooterTitle>
                    <FooterRow><Link to="/team">Team</Link></FooterRow>
                    <FooterRow><a href="mailto:hello@doxa.network">Jobs</a></FooterRow>
                </FooterCol>
            </FooterContainer>
        )
    }
}