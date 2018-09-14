pragma solidity ^0.4.18;

contract TransferGate {
    function availableToTransfer(address _owner, address _receiver)
    view public 
    returns (uint256);
}