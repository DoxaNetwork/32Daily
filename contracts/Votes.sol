pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

import './Spoke.sol';


contract Votes is Spoke {
  using SafeMath for uint256;

    // sha3(version,backer) -> total amount this person is backing
    mapping (bytes32 => uint256) internal outgoingPostBackings;
    
    // sha3(version,postIndex) -> total amount backing this post
    mapping (bytes32 => uint256) internal incomingPostBackings;

    function outgoingVotes(bytes32 _ownerKey)
    view public
    returns (uint) 
    {
        return outgoingPostBackings[_ownerKey];
    }

    function incomingVotes(bytes32 _contentKey)
    view public
    returns (uint)
    {
        return incomingPostBackings[_contentKey];
    }

    function addVote(uint _value, bytes32 _ownerKey, bytes32 _contentKey)
    public onlyHub
    {
        outgoingPostBackings[_ownerKey] = outgoingPostBackings[_ownerKey].add(_value);
        incomingPostBackings[_contentKey] = incomingPostBackings[_contentKey].add(_value);
    }

}