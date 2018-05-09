pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './ContentPool.sol';
import './MemberRegistry.sol';
import './PublishedHistory.sol';
import './Votes.sol';
import './DoxaToken.sol';

// switch tests and app to use ethjS

contract DoxaHub is Ownable {
  using SafeMath for uint256;

	ContentPool contentPool;
	PublishedHistory publishedHistory;
	MemberRegistry memberRegistry;
	Votes votes;
	DoxaToken token;

	uint public SUBMISSION_MINT = 1;
	uint public nextPublishTime;

	event LinkPosted(address indexed owner, uint256 backing, uint256 index, bytes32 link);
	event PostBacked(address indexed backer, uint32 indexed version, uint postIndex, uint value);
	event Published(uint version, uint index);

	function DoxaHub(
		address _contentPool, 
		address _memberRegistry, 
		address _token, 
		address _publishedHistory, 
		address _votes) 
	public 
	{
		contentPool = ContentPool(_contentPool);
		memberRegistry = MemberRegistry(_memberRegistry);
		token = DoxaToken(_token);
		publishedHistory = PublishedHistory(_publishedHistory);
		votes = Votes(_votes);

		owner = msg.sender;
		nextPublishTime = nextUTCMidnight(now);
	}

	function postLink(bytes32 link) 
	public 
	{
		contentPool.newContent(msg.sender, link);
		token.mint(msg.sender, SUBMISSION_MINT);
		LinkPosted(msg.sender, 0, contentPool.poolLength() - 1, link);
	}

	function getLinkByIndex( uint256 index ) 
	public view 
	returns( uint256, address owner, bytes32 link, uint256 backing ) 
	{
		var (poster, content) = contentPool.getItem(index);
		bytes32 postKey = keccak256(contentPool.currentVersion(), index);
		return (index, poster, content, votes.incomingVotes(postKey));
	}
	
	function getLinkCount() 
	public view
	returns (uint)
	{
		return contentPool.poolLength();
	}

	function backPost(uint256 _postIndex, uint256 _value) 
	public
	{
		require(_postIndex >= 0 && _postIndex < contentPool.poolLength() );
		require(_value <= availableToTransfer(msg.sender));

		bytes32 ownerKey = keccak256(contentPool.currentVersion(), msg.sender);
		bytes32 postKey = keccak256(contentPool.currentVersion(), _postIndex);

		votes.addVote(_value, ownerKey, postKey);
		PostBacked(msg.sender, contentPool.currentVersion(), _postIndex, _value);
	}

	function backPosts(uint256[] _postIndexes, uint256[] voteValues) 
	public 
	{
		for (uint i = 0; i < _postIndexes.length; i++) {
			backPost(_postIndexes[i], voteValues[i]);
		}
	}

	function totalPostBacking(uint256 _index)
	view public 
	returns (uint256) {
		bytes32 postKey = keccak256(contentPool.currentVersion(), _index);
		return votes.incomingVotes(postKey);
	}

	function availableToTransfer(address _owner) 
	view public 
	returns (uint256) {
		bytes32 ownerKey = keccak256(contentPool.currentVersion(), _owner);
		return token.balanceOf(_owner).sub(votes.outgoingVotes(ownerKey));
	}

	function publish() 
	public 
	{
		require(now > nextPublishTime);
		uint maxVotes = 0;
		uint indexToPublish = 0;
		bool somethingSelected = false;

		for (uint i = 0; i < contentPool.poolLength(); i++) {
			bytes32 postKey = keccak256(contentPool.currentVersion(), i);
			if (!somethingSelected || votes.incomingVotes(postKey) > maxVotes) {
				maxVotes = votes.incomingVotes(postKey);
				indexToPublish = i;
				somethingSelected = true;
			}
		}
		if(somethingSelected) {
			publishedHistory.publish(contentPool.currentVersion(), indexToPublish);
			Published(contentPool.currentVersion(), 0);
		}
		contentPool.clear();
		nextPublishTime = nextUTCMidnight(now);
	}

	function currentVersion() 
	public view
	returns (uint32)
	{
		return contentPool.currentVersion();
	}
	
	function getVersionLength(uint32 version) 
	public view
	returns (uint) {
		return publishedHistory.blockLength(version);
	}

	function getPublishedItem(uint32 version, uint index) 
	public view
	returns (address poster, bytes32 content)
	{
		uint poolIndex = publishedHistory.getItem(version, index);
		return contentPool.getPastItem(version, poolIndex);
	}

	// ======================= Membership functions =======================

	function memberCount() 
	public view 
	returns (uint count) 
	{
		return memberRegistry.memberCount();
	}

	function getMember(uint _index) 
	public view 
	returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_) 
	{
		var (name, owner) = memberRegistry.getMember(_index);
		return (name, owner, token.balanceOf(owner), 0, availableToTransfer(owner));
	}

	function getMemberByAddress(address _owner) 
	public view 
	returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_) 
	{
		var (name, owner) = memberRegistry.getMemberByAddress(_owner);
		return (name, owner, token.balanceOf(owner), 0, availableToTransfer(owner));
	}

	function register(bytes32 _name) 
	public 
	{
		uint256 dispersal = 1000; 
		token.mint(msg.sender, dispersal);
		memberRegistry.createMember(msg.sender, _name);
	}

	// ========================= Helpers =================================

	function nextUTCMidnight(uint timestamp)
	public pure
	returns (uint)
	{
		return (timestamp / 1 days) * 1 days + 1 days;
	}
}