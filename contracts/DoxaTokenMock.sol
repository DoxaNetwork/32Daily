pragma solidity ^0.4.11;


import './DoxaToken.sol';

contract DoxaTokenMock is DoxaToken {

	function DoxaTokenMock(address initialAccountA, uint256 initialBalanceA, address initialAccountB, uint256 initialBalanceB)
	public
	{
		balances[initialAccountA] = initialBalanceA;
		balances[initialAccountB] = initialBalanceB;

		totalSupply_ = initialBalanceA + initialBalanceB;
	}
}