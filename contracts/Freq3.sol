pragma solidity ^0.4.24;

// import './HigherFreq.sol';
import './DoxaHub.sol';

contract Freq3 is DoxaHub {

    function Freq3 (
        uint period, 
        address _doxaToken,
        address _sideChain,
        address _votes, 
        address _publishedHistory)
    DoxaHub(
        period, 
        _doxaToken,
        _sideChain,
        _votes, 
        _publishedHistory)
    public {}
}