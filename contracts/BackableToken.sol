pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

// TODO
// only registered members should be able to be elected
// delete BackableTokenMock
// split this contract into smaller contracts
// switch tests and app to use ethjs

contract BackableToken is BasicToken {


	// ========================= basic data about MEMBERS ==============================
	uint256 constant MEMBERSHIP_THRESHOLD = 1;
	struct Member {
		string username;
		address owner;
		bool active; // not using this yet
		bool elected; // whether or not they are above the threshold
		uint electedIndex;
		uint index;
	}

	// array of addresses that point to a Member
	// used to iterate through members
	// remove an entry to delete
	address[] public memberList; 

	// create the indexes
	mapping (bytes32 => Member) public userNameMap;
	mapping (address => Member) public addressMap;



	// ======================= data about BACKINGS =====================================
	// backer -> (backee -> amount)
	mapping (address => mapping (address => uint256)) internal backed;

	// is it better to store these or calculate them on the fly from `backed`?
	// address -> total amount already backing someone else
	mapping (address => uint256) internal outgoing; // outgoing backs
	// address -> total amount backing this address
	mapping (address => uint256) internal incoming; // incoming backs


	
	// ========================= data about ELECTIONS ===================================
	uint256 constant ELECTION_THRESHOLD = 1000;
	// TODO use this
	address[] public electedMembers; // TODO should this be an array of members?

	// this should be a flag on the Member, combined with an list index
	mapping (address => bool) public electedMap; // this needs to be defaulted to false?



	// ========================= data about CONTENT ======================================

	string[] public links;


	// ========================= events ==================================================
	event Mint(address indexed to, uint256 _amount);
	// event MemberCreated();
	// event LinkPosted();
	// event Elected();
	// event Unelected();
	// event Backing();
	// event Unbacking();
	// TODO maybe combine Backing/Unbacking and Elected/Unelected




	function memberCount() public constant returns (uint count) {
		return memberList.length;
	}

	function findMemberByAddress(address _owner) public constant returns (address owner, string username, bool active, bool elected, uint256 balance, uint256 backing) {
		return (_owner, addressMap[_owner].username, addressMap[_owner].active, addressMap[_owner].elected, balances[_owner], incoming[_owner]);
	}

	function findMemberByUserName(string _username) public constant returns (address owner, string username, bool active, bool elected, uint256 balance, uint256 backing) {
		bytes32 key = keccak256(_username);
		// TODO is there any gas cost to temporarily storing a variable in memory? that could simplify the next line
		return (userNameMap[key].owner, userNameMap[key].username, userNameMap[key].active, userNameMap[key].elected, balances[userNameMap[key].owner], incoming[userNameMap[key].owner]);
	}

	function register(string _username) public payable returns (bool) {
		mint(msg.sender, msg.value);
		createMember(msg.sender, _username); // TODO this should revert if the minting did not create enough
		return true;
	}

	// register a new user
	// requires that some minimum amount of token is alrady held
	function createMember(address _address, string _username) public returns (bool) {
		require(balances[_address] > MEMBERSHIP_THRESHOLD);

		Member memory newMember = Member({
			username: _username,
			owner: _address,
			active: true,
			elected: false,
			index: memberList.length,
			electedIndex: 0
		});

		// add the address to the memberList
		memberList.push(newMember.owner);

		// create link from username to member struct
		userNameMap[keccak256(newMember.username)] = newMember;

		// create link from address to member struct
		addressMap[newMember.owner] = newMember;

		// check if this member should be elected
		checkElection(_address);

		return true; // should this return the memberList index?
	}

	// only changes state if necessary. always returns true
	function setElected(address _address) public returns (bool) {
		// if already elected, dont re-set
		if (!isElected(_address)) {
			addressMap[_address].elected = true;
			addressMap[_address].electedIndex = electedMembers.length;
			electedMembers.push(_address);
		}
		return true;
	}

	// only changes state if necessary. always returns true
	function setUnelected(address _address) public returns (bool) {
		if (isElected(_address)) {
			// Member memory member = addressMap[_address] // TODO this would be easier to read, but would it be costly?

			// copy the electedMember at the end of the list to the soon-to-be empty position
			electedMembers[addressMap[_address].electedIndex] = electedMembers[electedMembers.length - 1];
			electedMembers.length--;

			addressMap[_address].elected = false;
			addressMap[_address].electedIndex = 0; // TODO if we skip the 0 index, we can drop the elected bool
		}
		return true;
	}

	// update the member's election status
	// return true if member is now elected
	function checkElection(address _address) public returns (bool) {
		if (totalBacking(_address) >= ELECTION_THRESHOLD) {
			setElected(_address);
		} else {
			setUnelected(_address);
		}
		return addressMap[_address].elected;
	}

	function isElected(address _address) public constant returns (bool) {
		return addressMap[_address].elected;
	}

	// return total held minus total outgoing backed
	function availableToSend(address _from) constant internal returns (uint256 available) {
		return balances[_from].sub(outgoing[_from]);
	}

	// return total held plus total incoming backed
	function totalBacking(address _to) constant public returns (uint256 total) {
		return balances[_to].add(incoming[_to]);
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

		// user may have bought enough to already be elected
		checkElection(_to);

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

		checkElection(_to);

		return true;
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		// we override transfer to replace balances[] with availableToSend[] in the next line
    	require(_value <= availableToSend(msg.sender));

    	balances[msg.sender] = balances[msg.sender].sub(_value);
    	balances[_to] = balances[_to].add(_value);

    	checkElection(_to);
    	checkElection(msg.sender);

    	Transfer(msg.sender, _to, _value);

    	// TODO possibly de-activate member if balance has dropped below MEMBERSHIP_THRESHOLD

    	return true;
	}
	
	function () payable {
		// finney = milliether, szabo = microether
		// TODO decide on price curve
		uint256 price = 1 finney + SafeMath.mul(5 szabo, totalSupply);
		uint256 dispersal = SafeMath.div(msg.value, price);
		mint(msg.sender, dispersal);
	}
	
	function mint(address _to, uint256 _amount) private returns (bool) {
		totalSupply = totalSupply.add(_amount);
		balances[_to] = balances[_to].add(_amount);
		Mint(_to, _amount);
		Transfer(0x0, _to, _amount);
		return true;
	}

	function postLink(string link) public returns(bool) {
		require(checkElection(msg.sender) == true);
		links.push(link);
		uint256 payout = 100;
		mint(msg.sender, payout);
		return true;
	}

}