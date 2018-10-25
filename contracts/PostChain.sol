pragma solidity ^0.4.24;
import './Spoke.sol';
import './PostChainAbstract.sol';

contract PostChain is PostChainAbstract, Spoke {

    struct Post 
    {
        address poster;
        uint96 timeStamp; // this does not need to be so big, we could store more data in this struct for free
        bytes32 ipfsHash;
    }

    Post[] public postList;

    function newPost(address _poster, bytes32 _ipfsHash)
    public
    returns (uint index_)
    {
        Post memory newPostItem = Post(
        {
            poster: _poster,
            ipfsHash: _ipfsHash,
            timeStamp: uint96(now)
        });

        postList.push(newPostItem);

        return postList.length - 1;
    }

    function getPost(uint _index) 
    public view
    returns (address poster, bytes32 ipfsHash, uint timeStamp, address[4] approvedChains_, uint approvedChainsCount)
    {
        address[4] memory approvedChains; 
        approvedChainsCount = 0;
        return (postList[_index].poster, postList[_index].ipfsHash, uint(postList[_index].timeStamp), approvedChains, approvedChainsCount);
    }

    function length() 
    public view 
    returns (uint) 
    {
        return postList.length;
    }
}