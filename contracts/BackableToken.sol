pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract BackableToken is BasicToken {

	uint256 constant THRESHOLD = 1000;

	// backer -> (backee -> amount)
	mapping (address => mapping (address => uint256)) internal backed;

	// is it better to store these or calculate them on the fly from `backed`?
	// address -> total amount already backing someone else
	mapping (address => uint256) internal outgoing; // outgoing backs
	// address -> total amount backing this address
	mapping (address => uint256) internal incoming; // incoming backs

	mapping (address => bool) public electedMap; // this needs to be defaulted to false?

	// helper for tests
	// how can I get the return value of this?
	function confirmElection(address user) public returns (bool) {
		if (totalTokens(user) >= THRESHOLD) {
			electedMap[user] = true;
		}
		return electedMap[user];
	}

	// helper for tests
	function checkElectionStatus(address user) constant public returns (bool) {
		return electedMap[user];
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
		if (!electedMap[_to] && totalTokens(_to) >= THRESHOLD) {
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
		if (electedMap[_to] && totalTokens(_to) < THRESHOLD) {
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
    	if (electedMap[msg.sender] && totalTokens(msg.sender) < THRESHOLD) {
			electedMap[msg.sender] = true;
		}
		// possibly elect receiving address
		if (!electedMap[_to] && totalTokens(_to) >= THRESHOLD) {
			electedMap[_to] = true;
		}
    	Transfer(msg.sender, _to, _value);
    	return true;
	}
	

	string[] public links;

	function postLink(string link) public returns(bool) {
		require(electedMap[msg.sender] == true);

		links.push(link);

		uint256 payout = 100;
		mint(msg.sender, payout);

		return true;
	}

	function getLinks() private returns(string[]) {
		return links;
	}


	function () payable {
		//ether is burned by being locked to contract

		// finney = milliether, szabo = microether
		uint256 price = 1 finney + SafeMath.mul(5 szabo, totalSupply);
		uint256 dispersal = SafeMath.div(msg.value, price);
		mint(msg.sender, dispersal);
	}

	event Mint(address indexed to, uint256 _amount);
	
	function mint(address _to, uint256 _amount) private returns (bool) {
		totalSupply = totalSupply.add(_amount);
		balances[_to] = balances[_to].add(_amount);
		Mint(_to, _amount);
		Transfer(0x0, _to, _amount);
		return true;
	}

}