pragma solidity ^0.4.11;


import './BackableTokenSmall.sol';

contract BackableTokenSmallMock is BackableTokenSmall {

	function BackableTokenSmallMock(address initialAccountA, uint256 initialBalanceA, address initialAccountB, uint256 initialBalanceB) public
	{
		balances[initialAccountA] = initialBalanceA;
		balances[initialAccountB] = initialBalanceB;

		totalSupply_ = initialBalanceA + initialBalanceB;
	}
}