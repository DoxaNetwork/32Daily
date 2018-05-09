pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';


contract BackableTokenSmall is BasicToken, Ownable {

	address hubContract;
	// event Mint(address indexed to, uint256 _amount);

	// function BackableTokenSmall();

	function assignHub(address hubContractAddress) 
	public onlyOwner
	returns (bool);

	modifier onlyHub() {
	  require(msg.sender == hubContract);
	  _;
	}

	function mint(address _to, uint256 _quantity) 
	public onlyHub 
	returns (bool);

	// we override transfer to replace balances[] with availableToTransfer()
	// function transfer(address _to, uint256 _value) 
	// public 
	// returns (bool);

}