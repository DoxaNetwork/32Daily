import styled from 'styled-components';

export const Button = styled.button`
    border: 1px solid var(--primary);
    background-color: var(--primary);
    width: 127px;
    height: 50px;
    padding: 0px;
    color: var(--white);
    transition: all 200ms ease-in-out;
    cursor: pointer;
    font-size: 1em;

    &.unsaved {
        border: 1px solid var(--secondary);
        background-color: var(--secondary);
    }

    &:hover {
        background-color: var(--primary);
        border: 1px solid var(--primary);
    }
`