pragma solidity ^0.4.24;

import './HigherFreq.sol';

contract Freq3 is HigherFreq {

    function Freq3 (
        uint period, 
        address _lowerFreq, 
        address _votes, 
        address _publishedHistory,
        address _postChain,
        address _sideChain,
        address _doxaToken)
    HigherFreq(
        period, 
        _lowerFreq, 
        _votes, 
        _publishedHistory,
        _postChain,
        _sideChain,
        _doxaToken)
    public {}
}