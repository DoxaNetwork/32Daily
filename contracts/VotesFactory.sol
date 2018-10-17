pragma solidity ^0.4.24;

import './Votes.sol';

contract VotesFactory {
    event Deployed(address newContract);

    function newContract()
    public
    returns (address newVotesDB) {
        Votes v = new Votes();
        emit Deployed(v);
        return address(v);
    }
}