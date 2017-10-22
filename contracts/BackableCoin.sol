pragma solidity ^0.4.11;

// import 'zeppelin-solidity/contracts/token/BasicToken.sol';


// contract BackableToken is BasicToken {

// 	uint256 constant THRESHOLD = 1000;

// 	// backer -> (backee -> amount)
// 	mapping (address => mapping (address => uint256)) internal backed;

// 	// is it better to store these or calculate them on the fly from `backed`?
// 	// address -> total amount already backing someone else
// 	mapping (address => uint256) internal outgoing; // outgoing backs
// 	// address -> total amount backing this address
// 	mapping (address => uint256) internal incoming; // incoming backs

// 	mapping (address => bool) public electedMap; // this needs to be defaulted to false?

// 	// return total held minus total outgoing backed
// 	function availableToSend(address _from) constant public returns (uint256 available) {
// 		return balances[_from].sub(outgoing[_from]);
// 	}

// 	// return total held plus total incoming backed
// 	function totalTokens(address _to) constant public returns (uint256 total) {
// 		return balances[_to].add(incoming[_to]);
// 	}

// 	function back(address _to, uint256 _value) public returns (bool) {
// 		require(_to != address(0));
// 		require(_to != msg.sender); // can't back yourself, fool
// 		require(_value <= balances[msg.sender]); // unnecessary?
// 		require(_value <= availableToSend(msg.sender));

// 		// update the root mapping
// 		backed[msg.sender][_to].add(_value); // might want to separate initial backing versus increase?

// 		// update the caches
// 		outgoing[msg.sender].add(_value);
// 		incoming[_to].add(_value);

// 		// if not already elected, and over the thresold, then elect
// 		if (!electedMap[_to]) && totalTokens[_to] >= THRESHOLD) {
// 			electedMap[_to] = true;
// 		}

// 		return true;
// 	}

// 	// this only removes the entire backing. we may want to have partial unbacks
// 	function unback(address _to) public returns (bool) {
// 		require(_to != address(0));
// 		require(_to != msg.sender); // can't unback yourself, fool
// 		require(backed[msg.sender][_to] != 0);

// 		// update the caches
// 		outgoing[msg.sender].sub(backed[msg.sender][_to]);
// 		incoming[_to].sub(backed[msg.sender][_to]);

// 		// update the root mapping
// 		backed[msg.sender][_to] = 0;

// 		// if already elected, and no longer over the thresold, then un-elect
// 		if (electedMap[_to] && totalTokens[_to] < THRESHOLD) {
// 			electedMap[_to] = false;
// 			// todo how to pull full list of elected?
// 		}
// 	}

// 	function transfer(address _to, uint256 _value) public returns (bool) {
// 		require(_to != address(0));
// 		// override transfer to replace balances[] with availableToSend[]
//     	require(_value <= availableToSend[msg.sender]);

//     	balances[msg.sender] = balances[msg.sender].sub(_value);
//     	balances[_to] = balances[_to].add(_value);
//     	Transfer(msg.sender, _to, _value);
//     	return true;
// 	}
// }