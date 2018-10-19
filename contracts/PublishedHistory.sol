pragma solidity ^0.4.24;

import './Spoke.sol';


contract PublishedHistory is Spoke {

    struct PublishedPost
    {
        // neither of these need to be this big, but we should keep the total struct to 32 bytes
        uint64 postChainIndex; // pointer to the item in the ContentChain
        uint64 chainIndex; // which chain this came from 
        uint64 lowerChainIndex; // pointer to the item in the lowerFreqFeed, if this is from a lower feed
        uint64 publishedTime; // this can be used to pull in the votes
    } 

    PublishedPost[] public publishedHistory;

    function getPost(uint _publishedIndex)
    public view
    returns (uint postChainIndex_, uint chainIndex_, uint lowerChainIndex_, uint publishedTime_)
    {
        return (
            uint(publishedHistory[_publishedIndex].postChainIndex), 
            uint(publishedHistory[_publishedIndex].chainIndex), 
            uint(publishedHistory[_publishedIndex].lowerChainIndex), 
            uint(publishedHistory[_publishedIndex].publishedTime)
        );
    }

    function publishPost(uint _postChainIndex, uint _chainIndex, uint _lowerChainIndex)
    public onlyHub
    returns (uint publishedIndex_)
    {
        PublishedPost memory newPublishedPost = PublishedPost(
        {
            postChainIndex: uint64(_postChainIndex),
            chainIndex: uint64(_chainIndex),
            lowerChainIndex: uint64(_lowerChainIndex),
            publishedTime: uint64(now) 
        });

        publishedHistory.push(newPublishedPost);

        return publishedHistory.length - 1;
    }

    function length()
    public view
    returns (uint)
    {
        return publishedHistory.length;
    }
}