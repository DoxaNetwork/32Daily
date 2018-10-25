pragma solidity ^0.4.24;

contract PostChainAbstract {

    function getPost(uint _index) 
    public view
    returns (address poster, bytes32 ipfsHash, uint timeStamp, address[4] approvedChains, uint approvedChainsCount);

    function length() 
    public view 
    returns (uint);
}