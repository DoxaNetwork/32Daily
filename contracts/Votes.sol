pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

import './Spoke.sol';


contract Votes is Spoke {
  using SafeMath for uint;

    // sha3(voter, timeStampNextPublishing) -> total amount this voter-cycle backed
    mapping (uint => uint) internal outgoingPostBackings;
    
    mapping (uint => uint) internal incomingPostBackings;

    function outgoingVotesThisCycle(address _voter, uint _nextPublishTime)
    view public
    returns (uint) 
    {
        // how many votes this address has sent out this cycle
        uint voterCycleKey = createKey(_nextPublishTime, _voter);
        return outgoingPostBackings[voterCycleKey];
    }

    // if we keyed this as (index, freq) then we could maybe get away with only one Votes contract
    function incomingVotes(uint _postIndex, address _chainAddress)
    view public
    returns (uint)
    {
        // how many votes this item received
        // must combine _postIndex and chainIndex into one number
        uint postChainKey = createKey(_postIndex, _chainAddress);
        return incomingPostBackings[postChainKey];
    }

    function addVote(address _voter, uint _postIndex, uint _nextPublishTime, address _chainAddress)
    public onlyHub
    {
        // make sure voting is open for this item
        // or maybe we don't care if they vote for a past item? it wont affect publishing 
        uint voterCycleKey = createKey(_nextPublishTime, _voter);
        uint postChainKey = createKey(_postIndex, _chainAddress);

        outgoingPostBackings[voterCycleKey] = outgoingPostBackings[voterCycleKey].add(1);
        incomingPostBackings[postChainKey] = incomingPostBackings[postChainKey].add(1);
    }

    function createKey(uint _index, address _address)
    internal pure
    returns (uint)
    {
        uint combined = _index;
        combined |= uint(_address)<<160;
        return combined;
    }
}