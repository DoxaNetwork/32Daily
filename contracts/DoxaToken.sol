pragma solidity ^0.4.18;
 
import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';

import './DoxaHub.sol';
import './Spoke.sol';


contract DoxaToken is BasicToken, Spoke {

	event Mint(address indexed to, uint256 _amount);

	function mint(address _to, uint256 _quantity) 
	public onlyHub 
	{
		totalSupply_ = totalSupply_.add(_quantity);
		balances[_to] = balances[_to].add(_quantity);
		Mint(_to, _quantity);
		Transfer(0x0, _to, _quantity);
	}

	// we override transfer to replace balances[] with availableToTransfer()
	function transfer(address _to, uint256 _value) 
	public 
	returns (bool) 
	{
		require(_to != address(0));
		DoxaHub doxaHub = DoxaHub(hub);
    	require(_value <= doxaHub.availableToTransfer(msg.sender));

    	balances[msg.sender] = balances[msg.sender].sub(_value);
    	balances[_to] = balances[_to].add(_value);

    	Transfer(msg.sender, _to, _value);
    	return true;
	}

}