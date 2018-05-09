pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './ContentPool.sol'; //TODO - import interface instead of code itself
import './MemberRegistry.sol'; //TODO - import interface instead of code itself
import './Published.sol';
import './VotingStuff.sol';
import './BackableTokenSmall.sol';

// TODO
// only registered members should be able to be elected
// delete BackableTokenMock
// split this contract into smaller contracts
// -- pull out voting
// -- pull out published history 

// switch tests and app to use ethjS

contract BackableToken is Ownable {
  using SafeMath for uint256;
	

	ContentPool contentPool;
	MemberRegistry memberRegistry;
	BackableTokenSmall token;
	something published;
	VotingStuff votingStuff;

	uint SUBMISSION_MINT = 1;
	uint public nextPublishTime;

	// ========================= events ==================================================

	// event Mint(address indexed to, uint256 _amount);
	event LinkPosted(address indexed owner, uint256 backing, uint256 index, bytes32 link);
	event PostBacked(address indexed backer, uint32 indexed version, uint postIndex, uint value);
	// event MemberCreated();
	// event ElectionChange();
	// event BackingChange();
	event Published(uint version, uint index);


	function BackableToken(address _contentPoolAddress, address _memberRegistryAddress, address _tokenAddress, address _publishedAddress, address _votingStuffAddress) 
	public 
	{
		contentPool = ContentPool(_contentPoolAddress);
		memberRegistry = MemberRegistry(_memberRegistryAddress);
		token = BackableTokenSmall(_tokenAddress);
		published = something(_publishedAddress);
		votingStuff = VotingStuff(_votingStuffAddress);

		owner = msg.sender;
		nextPublishTime = nextUTCMidnight(now);
	}

	// ======================= data about POST BACKINGS ================================
	// sha3(version,backer) -> postIndex
	// mapping (bytes32 => uint256) internal outgoingPostBackings;
	
	// sha3(version,postIndex) -> total amount backing this post
	// mapping (bytes32 => uint256) internal incomingPostBackings;
	// uint[] internal incomingPostBackings; // this would have to be kept the same size as itemList[version]

	// {version1: [content1_index, content2_index], version2: [content3_index, content4_index]}
	// todo: this second int could be quite small (limited by number of posts in each version)
	// mapping (uint32 => uint[]) private publishedContent;

	function getVersionLength(uint32 version) 
	public view
	returns (uint) {
		return published.blockLength(version);
	}

	function getPublishedItem(uint32 version, uint index) 
	public view
	returns (address poster, bytes32 content)
	{
		uint poolIndex = published.getItem(version, index);
		// uint poolIndex = publishedContent[version][index];
		return contentPool.getPastItem(version, poolIndex);
	}

	// return total held minus total outgoing backed towards posts
	function availableToTransfer(address _owner) 
	view public 
	returns (uint256) {
		bytes32 ownerKey = keccak256(contentPool.currentVersion(), _owner);
		// return balances[_owner].sub(outgoingPostBackings[ownerKey]);
		return token.balanceOf(_owner).sub(votingStuff.outgoingVotes(ownerKey));
	}
	

	function totalPostBacking(uint256 _index)
	view public 
	returns (uint256) {
		bytes32 postKey = keccak256(contentPool.currentVersion(), _index);
		return votingStuff.incomingVotes(postKey);
		// return incomingPostBackings[postKey]; // make this public so we can remove this getter function
	}

	

	function backPost(uint256 _postIndex, uint256 _value) 
	public 
	returns (bool) {
		// index must match an existing post
		require(_postIndex >= 0 && _postIndex < contentPool.poolLength() );
		// user must have the available votes. if they don't, revert
		// TODO: automatically free up votes
		require(_value <= availableToTransfer(msg.sender));
		// TODO can't back a post you have posted

		// this tells us how many votes a person has cast
		bytes32 ownerKey = keccak256(contentPool.currentVersion(), msg.sender);
		// outgoingPostBackings[ownerKey] = outgoingPostBackings[ownerKey].add(_value);
		// this tells us how many votes a post has received 
		bytes32 postKey = keccak256(contentPool.currentVersion(), _postIndex);
		// incomingPostBackings[postKey] = incomingPostBackings[postKey].add(_value);

		votingStuff.addVote(msg.sender, _value, ownerKey, postKey);
		PostBacked(msg.sender, contentPool.currentVersion(), _postIndex, _value);
		// PostBacked(msg.sender, contentPool.currentVersion(), _postIndex, _value);
		return true;
	}

	function backPosts(uint256[] _postIndexes, uint256[] voteValues) 
	public 
	returns (bool) 
	{
		for (uint i = 0; i < _postIndexes.length; i++) {
			backPost(_postIndexes[i], voteValues[i]);
		}
		return true;
	}

	function postLink(bytes32 link) 
	public 
	returns(bool) 
	{
		contentPool.newContent(msg.sender, link);
		token.mint(msg.sender, SUBMISSION_MINT);
		LinkPosted(msg.sender, 0, contentPool.poolLength() - 1, link);
		return true;
	}

	function getLinkByIndex( uint256 index ) 
	public view 
	returns( uint256, address owner, bytes32 link, uint256 backing ) 
	{
		var (poster, content) = contentPool.getItem(index);
		bytes32 postKey = keccak256(contentPool.currentVersion(), index);
		return (index, poster, content, votingStuff.incomingVotes(postKey));
	}

	function getLinkCount() 
	public view
	returns (uint)
	{
		return contentPool.poolLength();
	}

	function clear() 
	public 
	returns (bool)
	{
		contentPool.clear();
		return true;
	}

	function currentVersion() 
	public view
	returns (uint32)
	{
		return contentPool.currentVersion();
	}

	function publish() 
	public 
	returns (bool)
	{
		require(now > nextPublishTime);
		uint maxVotes = 0;
		uint indexToPublish = 0;
		bool somethingSelected = false;

		for (uint i = 0; i < contentPool.poolLength(); i++) {
			bytes32 postKey = keccak256(contentPool.currentVersion(), i);
			if (!somethingSelected || votingStuff.incomingVotes(postKey) > maxVotes) {
				maxVotes = votingStuff.incomingVotes(postKey);
				indexToPublish = i;
				somethingSelected = true;
			}
		}
		if(somethingSelected) {
			published.publish(contentPool.currentVersion(), indexToPublish);
			// publishedContent[contentPool.currentVersion()].push(indexToPublish);
			Published(contentPool.currentVersion(), 0);
		}
		clear();
		nextPublishTime = nextUTCMidnight(now);
		return true;
	}

	// ======================= Currency functions =======================

	// return total held minus total outgoing backed
	// function availableToSend(address _adress) 
	// view internal 
	// returns (uint256 available) {
	// 	// TODO this must take into account quantity backing posts
	// 	return balances[_adress].sub(outgoing[_adress]);
	// }

	// function transfer(address _to, uint256 _value) 
	// public 
	// returns (bool) 
	// {
	// 	require(_to != address(0));
	// 	// we override transfer to replace balances[] with availableToSend[] in the next line
 //    	require(_value <= availableToSend(msg.sender));

 //    	balances[msg.sender] = balances[msg.sender].sub(_value);
 //    	balances[_to] = balances[_to].add(_value);

 //    	Transfer(msg.sender, _to, _value);

 //    	// TODO possibly de-activate member if balance has dropped below MEMBERSHIP_THRESHOLD

 //    	return true;
	// }
	
	// TODO this is being accidentally called when transactions are missing input data
	// function () 
	// private payable 
	// {
	// 	// finney = milliether, szabo = microether
	// 	// TODO decide on price curve
	// 	// uint256 price = 1 finney + SafeMath.mul(5 szabo, totalSupply);
	// 	//uint256 price = 10000000000000000000;
	// 	// uint256 dispersal = SafeMath.div(msg.value, price);
	// 	uint256 dispersal = 3;
	// 	mint(msg.sender, dispersal);
	// }
	
	// function mint(address _to, uint256 _quantity) 
	// private 
	// returns (bool) 
	// {
	// 	totalSupply_ = totalSupply_.add(_quantity);
	// 	balances[_to] = balances[_to].add(_quantity);
	// 	Mint(_to, _quantity);
	// 	Transfer(0x0, _to, _quantity);
	// 	return true;
	// }


	// ======================= Election functions =======================

	// ======================= data about BACKINGS =====================================
	// backer -> (backee -> amount)
	// mapping (address => mapping (address => uint256)) internal backed;

	// // address -> total amount already backing someone else
	// mapping (address => uint256) internal outgoing; // outgoing backs
	// // address -> total amount backing this address
	// mapping (address => uint256) internal incoming; // incoming backs

	// // return total held plus total incoming backed
	// function totalBacking(address _to)
	// view public
	// returns (uint256 total) {
	// 	return balances[_to].add(incoming[_to]);
	// }

	// function back(address _to, uint256 _value) 
	// public 
	// returns (bool) {
	// 	require(_to != address(0));
	// 	require(_to != msg.sender); // can't back yourself, fool
	// 	require(_value <= balances[msg.sender]); // TODO unnecessary?
	// 	require(_value <= availableToSend(msg.sender));

	// 	// update the root mapping
	// 	backed[msg.sender][_to] = backed[msg.sender][_to].add(_value); // might want to separate initial backing versus increase?

	// 	// update the caches
	// 	outgoing[msg.sender] = outgoing[msg.sender].add(_value);
	// 	incoming[_to] = incoming[_to].add(_value);

	// 	return true;
	// }

	// // this only removes the entire backing. we may want to have partial unbacks
	// function unback(address _to, uint256 _value) 
	// public 
	// returns (bool) 
	// {
	// 	require(_to != address(0));
	// 	require(_to != msg.sender); // can't unback yourself, fool
	// 	require(backed[msg.sender][_to] != 0);
	// 	require(_value <= backed[msg.sender][_to]);

	// 	// update the root mapping
	// 	backed[msg.sender][_to] = backed[msg.sender][_to].sub(_value);

	// 	// update the caches
	// 	outgoing[msg.sender] = outgoing[msg.sender].sub(_value);
	// 	incoming[_to] = incoming[_to].sub(_value);

	// 	return true;
	// }

	// ======================= Membership functions =======================

	// function memberCount() 
	// public view 
	// returns (uint count) 
	// {
	// 	return memberRegistry.memberCount();
	// }

	// function getMember(uint _index) 
	// public view 
	// returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_) 
	// {
	// 	var (name, owner) = memberRegistry.getMember(_index);
	// 	return (name, owner, balances[owner], incoming[owner], availableToBackPosts(owner));
	// }

	// function getMemberByAddress(address _owner) 
	// public view 
	// returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_) 
	// {
	// 	var (name, owner) = memberRegistry.getMemberByAddress(_owner);
	// 	return (name, owner, balances[owner], incoming[owner], availableToBackPosts(owner));
	// }

	// function register(bytes32 _name) 
	// public 
	// returns (bool) 
	// {
	// 	uint256 dispersal = 1000; 
	// 	mint(msg.sender, dispersal);
	// 	memberRegistry.createMember(msg.sender, _name);
	// 	return true;
	// }

	// ========================= Helpers =================================

	function nextUTCMidnight(uint timestamp)
	public pure
	returns (uint)
	{
		return (timestamp / 1 days) * 1 days + 1 days;
	}
}