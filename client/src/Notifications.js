import React, { Component } from 'react'
import styled from 'styled-components';
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'

const NotificationsContainer = styled.div`
    background-color: var(--bright);
    position: fixed;
    color: white;
    bottom: 0;
    width: 100%;
    text-align: center;
    line-height: 50px;
    font-size: 1.3em;
`

class _Notifications extends Component {
    render() {
        const notifications = this.props.notifications.reverse().map(m => <div key={m.timeStamp}>{m.message}</div>)
        return (
            <NotificationsContainer>
                <CSSTransitionGroup
                    transitionName="opacity"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={500}>
                        {notifications}
                </CSSTransitionGroup>
            </NotificationsContainer>
        )
    }
}

const mapStateToProps = state => ({
    notifications: state.notifications, // have got to initialize this somewhere
})

export const Notifications = connect(
    mapStateToProps
)(_Notifications)