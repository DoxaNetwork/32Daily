pragma solidity ^0.4.11;

import './BackableToken.sol';

// mock class using BackableToken for testing
contract BackableTokenMock is BackableToken {

	function BackableTokenMock(address initialAccountA, uint256 initialBalanceA, address initialAccountB, uint256 initialBalanceB) {
		balances[initialAccountA] = initialBalanceA;
		balances[initialAccountB] = initialBalanceB;

		totalSupply = initialBalanceA + initialBalanceB;
	}
}