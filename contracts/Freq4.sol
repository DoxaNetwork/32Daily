import './HigherFreq.sol';

contract Freq4 is HigherFreq {

    function Freq4 (
        uint period, 
        address _lowerFreq, 
        address _votes, 
        address _promoted,
        address _contentPool,
        address _doxaToken)
    HigherFreq(
        period, 
        _lowerFreq, 
        _votes, 
        _promoted,
        _contentPool,
        _doxaToken)
    public {}
}