pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './ContentPool.sol'; //TODO - import interface instead of code itself
import './MemberRegistry.sol'; //TODO - import interface instead of code itself

// TODO
// only registered members should be able to be elected
// delete BackableTokenMock
// split this contract into smaller contracts
// -- pull out membership
// -- pull out voting

// switch tests and app to use ethjS

contract BackableToken is BasicToken, Ownable {

	ContentPool contentPool;
	MemberRegistry memberRegistry;

	uint PUBLISH_THRESHOLD = 10;

	function BackableToken(address _contentPoolAddress, address _memberRegistryAddress) {
		owner = msg.sender;
		contentPool = ContentPool(_contentPoolAddress);
		memberRegistry = MemberRegistry(_memberRegistryAddress);
	}

	// ======================= data about BACKINGS =====================================
	// backer -> (backee -> amount)
	mapping (address => mapping (address => uint256)) internal backed;

	// is it better to store these or calculate them on the fly from `backed`?
	// address -> total amount already backing someone else
	mapping (address => uint256) internal outgoing; // outgoing backs
	// address -> total amount backing this address
	mapping (address => uint256) internal incoming; // incoming backs


	// ======================= data about POST BACKINGS ================================
	// postIndex -> (backer -> amount)
	mapping (uint256 => mapping (address => uint256)) internal backedPosts;

	// backer -> postIndex
	mapping (address => uint256) internal outgoingPostBackings;
	
	// postIndex -> total amount backing this post
	mapping (uint256 => uint256) internal incomingPostBackings;

	uint256[] publishIndex;

	// ========================= events ==================================================
	event Mint(address indexed to, uint256 _amount);
	event LinkPosted(address indexed owner, uint256 backing, uint256 index, bytes32 link);
	event PostBacked(address indexed backer, uint256 postIndex, uint256 value);
	// event MemberCreated();
	// event ElectionChange();
	// event BackingChange();


	function memberCount() public view 
	returns (uint count) 
	{
		return memberRegistry.memberCount();
	}

	function getMember(uint _index) public view 
	returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_) 
	{
		var (name, owner) = memberRegistry.getMember(_index);
		return (name, owner, balances[owner], incoming[owner], availableToBackPosts(owner));
	}

	function getMemberByAddress(address _owner) public view 
	returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_) 
	{
		var (name, owner) = memberRegistry.getMemberByAddress(_owner);
		return (name, owner, balances[owner], incoming[owner], availableToBackPosts(owner));
	}

	function register(bytes32 _name) public 
	returns (bool) 
	{
		uint256 dispersal = 1000; 
		mint(msg.sender, dispersal);
		memberRegistry.createMember(msg.sender, _name);
		return true;
	}

	// return total held minus total outgoing backed
	function availableToSend(address _adress) constant internal returns (uint256 available) {
		return balances[_adress].sub(outgoing[_adress]);
	}

	// return total held minus total outgoing backed towards posts
	// TODO these calculations should only occur internally when necessary. usually the client can calculate this 
	function availableToBackPosts(address _address) constant public returns (uint256 available) {
		return balances[_address].sub(outgoingPostBackings[_address]);
	}

	// return total held plus total incoming backed
	function totalBacking(address _to) constant public returns (uint256 total) {
		return balances[_to].add(incoming[_to]);
	}

	function totalPostBacking(uint256 _index) constant public returns (uint256 total) {
		return incomingPostBackings[_index]; // make this public so we can remove this getter function
	}

	function back(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		require(_to != msg.sender); // can't back yourself, fool
		require(_value <= balances[msg.sender]); // TODO unnecessary?
		require(_value <= availableToSend(msg.sender));

		// update the root mapping
		backed[msg.sender][_to] = backed[msg.sender][_to].add(_value); // might want to separate initial backing versus increase?

		// update the caches
		outgoing[msg.sender] = outgoing[msg.sender].add(_value);
		incoming[_to] = incoming[_to].add(_value);

		return true;
	}

	function backPost(uint256 _postIndex, uint256 _value) public returns (bool) {
		// index must match an existing post
		require(_postIndex >= 0 && _postIndex < contentPool.poolLength() );
		// user must have the available votes. if they don't, revert
		// TODO: automatically free up votes
		require(_value <= availableToBackPosts(msg.sender));
		// TODO can't back a post you have posted

		// update the root mapping
		backedPosts[_postIndex][msg.sender] = backedPosts[_postIndex][msg.sender].add(_value);

		// update the caches
		outgoingPostBackings[msg.sender] = outgoingPostBackings[msg.sender].add(_value);
		incomingPostBackings[_postIndex] = incomingPostBackings[_postIndex].add(_value);
		PostBacked(msg.sender, _postIndex, _value);
		return true;
	}

	function backPosts(uint256[] _postIndexes, uint256[] voteValues) public returns (bool) {
		for (uint i = 0; i < _postIndexes.length; i++) {
			backPost(_postIndexes[i], voteValues[i]);
		}
		return true;
	}

	// this only removes the entire backing. we may want to have partial unbacks
	function unback(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		require(_to != msg.sender); // can't unback yourself, fool
		require(backed[msg.sender][_to] != 0);
		require(_value <= backed[msg.sender][_to]);

		// update the root mapping
		backed[msg.sender][_to] = backed[msg.sender][_to].sub(_value);

		// update the caches
		outgoing[msg.sender] = outgoing[msg.sender].sub(_value);
		incoming[_to] = incoming[_to].sub(_value);

		return true;
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		// we override transfer to replace balances[] with availableToSend[] in the next line
    	require(_value <= availableToSend(msg.sender));

    	balances[msg.sender] = balances[msg.sender].sub(_value);
    	balances[_to] = balances[_to].add(_value);

    	Transfer(msg.sender, _to, _value);

    	// TODO possibly de-activate member if balance has dropped below MEMBERSHIP_THRESHOLD

    	return true;
	}
	
	// TODO this is being accidentally called when transactions are missing input data
	function () private payable {
		// finney = milliether, szabo = microether
		// TODO decide on price curve
		// uint256 price = 1 finney + SafeMath.mul(5 szabo, totalSupply);
		//uint256 price = 10000000000000000000;
		// uint256 dispersal = SafeMath.div(msg.value, price);
		uint256 dispersal = 3;
		mint(msg.sender, dispersal);
	}
	
	function mint(address _to, uint256 _quantity) private returns (bool) {
		totalSupply_ = totalSupply_.add(_quantity);
		balances[_to] = balances[_to].add(_quantity); // TODO just use transfer here
		Mint(_to, _quantity);
		Transfer(0x0, _to, _quantity);
		return true;
	}

	function postLink(bytes32 link) public returns(bool) {
		contentPool.newContent(msg.sender, link);
		// links.push(link);
		// linkPosters.push(msg.sender);
		LinkPosted(msg.sender, 0, contentPool.poolLength(), link);
		return true;
	}

	/** 
		* This function gets the link given an index
		* @param index the index of the link to get
		* @return a tuple with the owner and link at the index 
	*/
	function getLinkByIndex( uint256 index ) public view returns( uint256, address owner, bytes32 link, uint256 backing ) {
		var (poster, content) = contentPool.getItem(index);
		return (index, poster, content, incomingPostBackings[index]);
	}

	function getLinkCount() public view
	returns (uint)
	{
		return contentPool.poolLength();
	}

	function getPublishedContent() public view returns(uint256 numPub) {
		return publishIndex.length;
	}

	function clear() public returns (bool){
		contentPool.clear();
		return true;
	}

	function publish() public returns (bool){
		publishIndex.length = 0;
		for (uint i = 0; i < contentPool.poolLength(); i++) {
			if( incomingPostBackings[i] >= PUBLISH_THRESHOLD) {
				publishIndex.push(i);
			}
		}
		return true;
	}
}