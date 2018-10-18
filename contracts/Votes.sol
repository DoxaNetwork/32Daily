pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

import './Spoke.sol';


contract Votes is Spoke {
  using SafeMath for uint;

    // sha3(voter, timeStampNextPublishing) -> total amount this voter-cycle backed
    mapping (bytes32 => uint) internal outgoingPostBackings;
    
    mapping (uint => uint) internal incomingPostBackings;


    function outgoingVotesThisCycle(bytes32 _voterCycleKey)
    view public
    returns (uint) 
    {
        // how many votes this address has sent out this cycle
        return outgoingPostBackings[_voterCycleKey];
    }

    // if we keyed this as (index, freq) then we could maybe get away with only one Votes contract
    function incomingVotes(uint _postIndex)
    view public
    returns (uint)
    {
        // how many votes this item received
        return incomingPostBackings[_postIndex];
    }

    function addVote(uint _postIndex, bytes32 _voterCycleKey)
    public onlyHub
    {
        // make sure voting is open for this item
        // or maybe we don't care if they vote for a past item? it wont affect publishing 
        outgoingPostBackings[_voterCycleKey] = outgoingPostBackings[_voterCycleKey].add(1);

        incomingPostBackings[_postIndex] = incomingPostBackings[_postIndex].add(1);
    }
}