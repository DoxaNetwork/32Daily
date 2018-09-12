import './HigherFreq.sol';

contract Freq5 is HigherFreq {

    function Freq5 (
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