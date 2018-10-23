pragma solidity ^0.4.24;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract Spoke is Ownable {
  address public hub;

  event HubTransferred(address indexed previousHub, address indexed newHub);

  modifier onlyHub() {
    require(msg.sender == hub);
    _;
  }

  function assignHub(address newHub) 
    public onlyOwner
    {
      require(newHub != address(0));
      emit HubTransferred(hub, newHub);
      hub = newHub;
    }
}
