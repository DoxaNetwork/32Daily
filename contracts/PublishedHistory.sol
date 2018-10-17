pragma solidity ^0.4.18;

import './Spoke.sol';


contract PublishedHistory is Spoke {

    struct PublishedPost
    {
        // neither of these need to be this big, but we should keep the total struct to 32 bytes
        uint160 contentChainIndex; // pointer to the item in the ContentChain
        uint96 publishedTime; // this can be used to pull in the votes
    } 

    PublishedPost[] public publishedHistory;

    function getPost(uint _publishedIndex)
    public view
    returns (uint contentChainIndex_, uint publishedTime_)
    {
        return (
            uint(publishedHistory[_publishedIndex].contentChainIndex), 
            uint(publishedHistory[_publishedIndex].publishedTime)
        );
    }

    function publishPost(uint index)
    public onlyHub
    returns (uint publishedIndex_)
    {
        PublishedPost memory newPublishedPost = PublishedPost(
        {
            contentChainIndex: uint160(index),
            publishedTime: uint96(now) 
        });

        publishedHistory.push(newPublishedPost);

        return publishedHistory.length - 1;
    }
}