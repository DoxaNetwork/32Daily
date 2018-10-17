pragma solidity ^0.4.18;

import './PublishedHistory.sol';

contract HistoryFactory {
    event Deployed(address newContract);

    function newContract()
    public
    returns (address newHistory) {
        PublishedHistory c = new PublishedHistory();
        emit Deployed(c);
        return address(c);
    }
}