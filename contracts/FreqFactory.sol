pragma solidity ^0.4.24;

import './DoxaHub.sol';
import './PostChain.sol';
import './DoxaToken.sol';
import './Votes.sol';
import './PublishedHistory.sol';


contract FreqFactory {
    event Deployed(address postChain, address votes, address history, address hub);

    // function newContract(address tokenAddress, uint _period, string _name, string _symbol)
    function newContract(address _tokenAddress, uint _period)
    public
    returns (address newDoxaHub) {
        // DoxaToken token = DoxaToken(_tokenAddress);
        PostChain postChain = new PostChain();
        Votes votes = new Votes();
        PublishedHistory history = new PublishedHistory();

        // address _tokenAddress = address(token);
        address postChainAddress = address(postChain);
        address votesAddress = address(votes);
        address historyAddress = address(history);

        DoxaHub hub = new DoxaHub(_period, _tokenAddress, postChainAddress, votesAddress, historyAddress);
        address hubAddress = address(hub);

        // token.assignHub(hubAddress);
        postChain.assignHub(hubAddress);
        votes.assignHub(hubAddress);
        history.assignHub(hubAddress);

        hub.transferOwnership(tx.origin);
        // token.transferOwnership(tx.origin);
        postChain.transferOwnership(tx.origin);
        votes.transferOwnership(tx.origin);
        history.transferOwnership(tx.origin);

        emit Deployed(postChainAddress, votesAddress, historyAddress, hubAddress);
        return address(hub);
    }
}