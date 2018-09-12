pragma solidity ^0.4.18;
import './Ownable.sol';


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
      HubTransferred(hub, newHub);
      hub = newHub;
    }
}
