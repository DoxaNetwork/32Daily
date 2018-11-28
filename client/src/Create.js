import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components';

import { submitContent } from './actions'
import { Button, Back } from './styledComponents'
import { FaChevronLeft } from "react-icons/fa";
import { ClimbingBoxLoader } from 'react-spinners';


const CreateContainer1 = styled.div`
    background-color:#fafafa;
    min-height:100vh;
`

const CreateContainer2 = styled.div`
    width: 70%;
    margin: auto;

    @media only screen and (max-width: 649px) {
        width: 100%;
    }
`
const CreateContainer3 = styled.div`
    padding: 40px 20px;
    margin: auto;
`
const CreateHeader = styled.div`
    border-bottom: 2px solid var(--secondary);
    font-weight:800;
    color: var(--secondary);
    font-size: 2em;
`
const FormContainer = styled.div`
    background-color: var(--white);
    border-radius: 5px;
    margin-top: 40px;
`
const TextInputCount = styled.span`
    color: var(--gray);
    padding: 0 20px;
`
const CountedTextForm = styled.form`
    padding: 40px 40px 20px;
    @media only screen and (max-width: 649px) {
        padding: 40px 10px 20px;
    }
    textarea {
        /*font-family: Open sans;*/
        outline: none;
        padding:20px;
        font-size:1.2em;
        resize:none;
        border:none;
        width:calc(100% - 45px);
        height:160px;
    }
`
const CreateFooter = styled.div`
    text-align: center;
    padding: 20px;
`

const override = css`
    height:100% !important;
    width:100% !important;
    overflow:hidden;
`

class Create extends Component {
    state = {
        content: '',
        characterCount: 0,
        submitting: false
    }

    handleContentChange(event) {
        this.setState({content: event.target.value, characterCount: event.target.value.length})
    }

    submit(event) {
        this.setState({submitting:true})
        this.props.onSubmit(this.state.content);
        event.preventDefault();
    }

    componentDidUpdate(){
        let {shouldRedirect} = this.props;
        if(shouldRedirect === true){
            setTimeout(this.props.history.goBack, 500);
        }
    }

    componentWillMount() {
        this.props.clearRedirect()
    }
    componentWillUnmount() {
        this.props.clearRedirect()
    }

    render() {

        return (
            <CreateContainer1>
                <CreateContainer2>
                    <CreateContainer3>
                        <Back>
                            <NavLink to={"/" + this.props.match.path.split("/")[1] + "/submissions"}><FaChevronLeft/> Back</NavLink>
                        </Back>
                        <CreateHeader>
                            Create
                        </CreateHeader>
                        <FormContainer>
                            <CountedTextForm>
                                <textarea 
                                    autoComplete="off" 
                                    placeholder="What do you want to tell the world?" 
                                    name="content" 
                                    value={this.state.content} 
                                    onChange={this.handleContentChange.bind(this)}/>
                                <TextInputCount>{this.state.characterCount}</TextInputCount>
                            </CountedTextForm>
                            <CreateFooter>
                                <Button onClick={this.submit.bind(this)}>
                                    {!this.state.submitting && 
                                        "Submit"
                                    }
                                    <ClimbingBoxLoader
                                      className={`${override}`}
                                      color={'#fff'}
                                      size={7}
                                      loading={this.state.submitting}
                                    />
                                </Button>
                            </CreateFooter>
                        </FormContainer>  
                    </CreateContainer3>
                </CreateContainer2>
            </CreateContainer1>
        )
    }
}


const mapStateToProps = state => ({
    shouldRedirect: state.redirect,
})

const mapFreqtoDispatchtoProps = (freq) => (
    dispatch => ({
        onSubmit: (text) => dispatch(submitContent(text, freq)),
        clearRedirect: () => dispatch({type: "CLEAR_REDIRECT"})
    })
)

export const ContentForm = withRouter(connect(
    mapStateToProps,
    mapFreqtoDispatchtoProps('freq1')
)(Create))

export const ContentForm2 = withRouter(connect(
    mapStateToProps,
    mapFreqtoDispatchtoProps('freq2')
)(Create))

export const ContentForm3 = withRouter(connect(
    mapStateToProps,
    mapFreqtoDispatchtoProps('freq3')
)(Create))