pragma solidity ^0.4.24;

import './DoxaToken.sol';

contract TokenFactory {
    event Deployed(address newContract);

    function newContract()
    public
    returns (address newToken) {
        DoxaToken c = new DoxaToken();
        emit Deployed(c);
        return address(c);
    }
}