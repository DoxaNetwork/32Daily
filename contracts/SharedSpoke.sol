pragma solidity ^0.4.24;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract SharedSpoke is Ownable {
  mapping (address => bool) public hubs;

  event HubAdded(address indexed newHub);
  event HubRemoved(address indexed oldHub);

  modifier onlyHubs() {
    require(hubs[msg.sender]);
    _;
  }

  function addHub(address newHub) 
    public onlyOwner
    {
      require(newHub != address(0));
      emit HubAdded(newHub);
      hubs[newHub] = true;
    }

  function removeHub(address oldHub)
  public onlyOwner
  {
    emit HubRemoved(oldHub);
    hubs[oldHub] = false;
  }
}