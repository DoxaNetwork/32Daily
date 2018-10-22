pragma solidity ^0.4.24;

contract PostChainAbstract {

    // struct Post 
    // {
    //     address poster;
    //     uint96 timeStamp; // this does not need to be so big, we could store more data in this struct for free
    //     bytes32 ipfsHash;
    // }

    // Post[] public postList;

    // function newPost(address _poster, bytes32 _ipfsHash)
    // public;

    function getPost(uint _index) 
    public view
    returns (address poster, bytes32 ipfsHash, uint timeStamp);

    function length() 
    public view 
    returns (uint);
}