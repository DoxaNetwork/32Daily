pragma solidity ^0.4.18;
import './Spoke.sol';

contract PostChain is Spoke {

    struct Post 
    {
        address poster;
        uint96 timeStamp; // this does not need to be so big, we could store more data in this struct for free
        bytes32 ipfsHash;
    }

    Post[] public postList;

    constructor() 
    public 
    {
        owner = msg.sender;
    }

    function newPost(address _poster, bytes32 _ipfsHash)
    public onlyHub
    {
        Post memory newPostItem = Post(
        {
            poster: _poster,
            ipfsHash: _ipfsHash,
            timeStamp: uint96(now)
        });

        postList.push(newPostItem);
    }

    function getPost(uint _index) 
    public view
    returns (address poster, bytes32 ipfsHash, uint timeStamp)
    {
        return (postList[_index].poster, postList[_index].ipfsHash, uint(postList[_index].timeStamp));
    }

    function length() 
    public view 
    returns (uint) 
    {
        return postList.length;
    }
}