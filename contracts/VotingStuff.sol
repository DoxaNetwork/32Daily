pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract VotingStuff is Ownable {
  using SafeMath for uint256;
	

	// sha3(version,backer) -> postIndex
	mapping (bytes32 => uint256) internal outgoingPostBackings;
	
	// sha3(version,postIndex) -> total amount backing this post
	mapping (bytes32 => uint256) internal incomingPostBackings;

	address hubContract;

	// event PostBacked(address indexed backer, uint32 indexed version, uint postIndex, uint value);

	modifier onlyHub() {
	  require(msg.sender == hubContract);
	  _;
	}

	function assignHub(address hubContractAddress) 
	public onlyOwner
	returns (bool)
	{
		hubContract = hubContractAddress;
		return true;
	}

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

	function addVote(address _backer, uint _value, bytes32 _ownerKey, bytes32 _contentKey)
	public onlyHub
	returns (bool)
	{
		outgoingPostBackings[_ownerKey] = outgoingPostBackings[_ownerKey].add(_value);
		incomingPostBackings[_contentKey] = incomingPostBackings[_contentKey].add(_value);
		// PostBacked(_backer, contentPool.currentVersion(), _postIndex, _value);
		return true;
	}

}