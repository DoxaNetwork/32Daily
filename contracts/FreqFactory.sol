pragma solidity ^0.4.24;

import './DoxaHub.sol';
import './PostChain.sol';
import './DoxaToken.sol';
import './Votes.sol';
import './PublishedHistory.sol';


contract FreqFactory {
    event Deployed(address token, address postChain, address votes, address history, address hub);

    function newContract(uint period)
    public
    returns (address newDoxaHub) {
        DoxaToken token = new DoxaToken();
        PostChain postChain = new PostChain();
        Votes votes = new Votes();
        PublishedHistory history = new PublishedHistory();

        address tokenAddress = address(token);
        address postChainAddress = address(postChain);
        address votesAddress = address(votes);
        address historyAddress = address(history);

        DoxaHub hub = new DoxaHub(period, tokenAddress, postChainAddress, votesAddress, historyAddress);
        address hubAddress = address(hub);

        token.assignHub(hubAddress);
        postChain.assignHub(hubAddress);
        votes.assignHub(hubAddress);
        history.assignHub(hubAddress);

        hub.transferOwnership(tx.origin);

        emit Deployed(tokenAddress, postChainAddress, votesAddress, historyAddress, hubAddress);
        return address(hub);
    }
}