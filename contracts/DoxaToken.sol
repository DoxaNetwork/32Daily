pragma solidity ^0.4.18;
 
import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';

import './Spoke.sol';
import './TransferGate.sol';


contract DoxaToken is BasicToken, Spoke {

    event Mint(address indexed to, uint _amount);

    function mint(address _to, uint _quantity) 
    public onlyHub 
    {
        totalSupply_ = totalSupply_.add(_quantity);
        balances[_to] = balances[_to].add(_quantity);
        emit Mint(_to, _quantity);
        emit Transfer(0x0, _to, _quantity);
    }

    // we override transfer to replace balances[] with availableToTransfer()
    function transfer(address _to, uint _value) 
    public 
    returns (bool) 
    {
        require(_to != address(0));
        TransferGate gate = TransferGate(hub);
        require(_value <= gate.availableToTransfer(msg.sender, _to));

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

}