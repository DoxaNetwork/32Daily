pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract BackableToken is BasicToken {

	struct Member {
		string username;
		address _address;
		bool active;
	}

	uint256 constant ELECTION_THRESHOLD = 1000;
	uint256 constant MEMBERSHIP_THRESHOLD = 1;

	// backer -> (backee -> amount)
	mapping (address => mapping (address => uint256)) internal backed;

	// is it better to store these or calculate them on the fly from `backed`?
	// address -> total amount already backing someone else
	mapping (address => uint256) internal outgoing; // outgoing backs
	// address -> total amount backing this address
	mapping (address => uint256) internal incoming; // incoming backs

	mapping (address => bool) public electedMap; // this needs to be defaulted to false?

	Member[] public  members;

	mapping (bytes32 => Member) public userNameMap;
	mapping (address => Member) public addressMap;

	function memberCount() public constant returns (uint count) {
		return members.length;
	}

	function findMemberByAddress(address owner) public constant returns (string username, address _address, bool active) {
		return (addressMap[owner].username, addressMap[owner]._address, addressMap[owner].active);
	}

	function findMemberByUserName(string _username) public constant returns (string username, address _address, bool active) {
		bytes32 key = keccak256(_username);
		return (userNameMap[key].username, userNameMap[key]._address, userNameMap[key].active);
	}

	function register(string username) public payable returns (bool) {
		mint(msg.sender, msg.value);
		registerMember(msg.sender, username);
		return true;
	}

	// register a new user
	// requires that some minimum amount of token is alrady held
	function registerMember(address _address, string username) public returns (bool) {
		require(balances[_address] > MEMBERSHIP_THRESHOLD);


		Member memory newMember = Member({
			username: username,
			_address: _address,
			active: true
		});

		members.push(newMember);

		// create link from username to member struct
		userNameMap[keccak256(newMember.username)] = newMember;
		// create link from address to member struct
		addressMap[newMember._address] = newMember;

		return true;
	}

	// return total held minus total outgoing backed
	function availableToSend(address _from) constant internal returns (uint256 available) {
		return balances[_from].sub(outgoing[_from]);
	}

	// return total held plus total incoming backed
	function totalTokens(address _to) constant internal returns (uint256 total) {
		return balances[_to].add(incoming[_to]);
	}

	function back(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		require(_to != msg.sender); // can't back yourself, fool
		require(_value <= balances[msg.sender]); // unnecessary?
		require(_value <= availableToSend(msg.sender));

		// update the root mapping
		backed[msg.sender][_to] = backed[msg.sender][_to].add(_value); // might want to separate initial backing versus increase?

		// update the caches
		outgoing[msg.sender] = outgoing[msg.sender].add(_value);
		incoming[_to] = incoming[_to].add(_value);

		// if not already elected, and over the thresold, then elect
		if (!electedMap[_to] && totalTokens(_to) >= ELECTION_THRESHOLD) {
			electedMap[_to] = true;
		}

		return true;
	}

	// this only removes the entire backing. we may want to have partial unbacks
	function unback(address _to) public returns (bool) {
		require(_to != address(0));
		require(_to != msg.sender); // can't unback yourself, fool
		require(backed[msg.sender][_to] != 0);

		// update the caches
		outgoing[msg.sender] = outgoing[msg.sender].sub(backed[msg.sender][_to]);
		incoming[_to] = incoming[_to].sub(backed[msg.sender][_to]);

		// update the root mapping
		backed[msg.sender][_to] = 0;

		// if already elected, and no longer over the thresold, then un-elect
		if (electedMap[_to] && totalTokens(_to) < ELECTION_THRESHOLD) {
			electedMap[_to] = false;
			// todo how to pull full list of elected?
		}
		return true;
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		// override transfer to replace balances[] with availableToSend[]
    	require(_value <= availableToSend(msg.sender));

    	balances[msg.sender] = balances[msg.sender].sub(_value);
    	balances[_to] = balances[_to].add(_value);

    	// possibly unelect sending address
    	if (electedMap[msg.sender] && totalTokens(msg.sender) < ELECTION_THRESHOLD) {
			electedMap[msg.sender] = true;
		}
		// possibly elect receiving address
		if (!electedMap[_to] && totalTokens(_to) >= ELECTION_THRESHOLD) {
			electedMap[_to] = true;
		}
    	Transfer(msg.sender, _to, _value);

    	// TODO possibly de-activate member if balance has dropped below MEMBERSHIP_THRESHOLD

    	return true;
	}
	
	function () payable {
		//ether is burned by being locked to contract
		mint(msg.sender, msg.value);
	}

	event Mint(address indexed to, uint256 dispersal);
	
	function mint(address _to, uint256 _amount) private returns (bool) {

		//require(); require that this is called by the contract

		//uint256 price = 1000000000000000000 + SafeMath.mul(5, totalSupply);
		uint256 price = 1000000000000000000;
		uint256 dispersal = SafeMath.div(_amount, price);

		totalSupply = totalSupply.add(dispersal);
		balances[_to] = balances[_to].add(dispersal);
		Mint(_to, dispersal);
		Transfer(0x0, _to, dispersal);
		return true;
	}

	// helper for tests
	// how can I get the return value of this?
	function confirmElection(address _address) public returns (bool) {
		if (totalTokens(_address) >= ELECTION_THRESHOLD) {
			electedMap[_address] = true;
		}
		return electedMap[_address];
	}

	// helper for tests
	function checkElectionStatus(address user) constant public returns (bool) {
		return electedMap[user];
	}

}