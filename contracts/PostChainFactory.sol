pragma solidity ^0.4.24;

import './PostChain.sol';

contract PostChainFactory {
    event Deployed(address newContract);

    function newContract()
    public
    returns (address newPostChain) {
        PostChain c = new PostChain();
        emit Deployed(c);
        return address(c);
    }
}