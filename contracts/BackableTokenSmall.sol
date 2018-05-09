pragma solidity ^0.4.18;
 
import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './BackableToken.sol';


contract BackableTokenSmall is BasicToken, Ownable {

	address hubContract;
	event Mint(address indexed to, uint256 _amount);

	function BackableTokenSmall() 
	{
		owner = msg.sender;
	}

	function assignHub(address hubContractAddress) 
	public onlyOwner
	returns (bool)
	{
		hubContract = hubContractAddress;
		return true;
	}

	modifier onlyHub() {
	  require(msg.sender == hubContract);
	  _;
	}

	// function availableToTransfer(address _owner) 
	// view internal 
	// returns (uint256 available) {
	// 	return hubContract.availableToTransfer(_owner);
	// 	return balances[_owner].sub(hubContract.outgoingVotes(_owner));
	// }

	function mint(address _to, uint256 _quantity) 
	public onlyHub 
	returns (bool) 
	{
		totalSupply_ = totalSupply_.add(_quantity);
		balances[_to] = balances[_to].add(_quantity);
		Mint(_to, _quantity);
		Transfer(0x0, _to, _quantity);
		return true;
	}

	// we override transfer to replace balances[] with availableToTransfer()
	function transfer(address _to, uint256 _value) 
	public 
	returns (bool) 
	{
		require(_to != address(0));
		BackableToken backableToken = BackableToken(hubContract);
    	require(_value <= backableToken.availableToTransfer(msg.sender));

    	balances[msg.sender] = balances[msg.sender].sub(_value);
    	balances[_to] = balances[_to].add(_value);

    	Transfer(msg.sender, _to, _value);
    	return true;
	}

}