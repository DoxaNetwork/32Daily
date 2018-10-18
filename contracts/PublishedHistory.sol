pragma solidity ^0.4.24;

import './Spoke.sol';


contract PublishedHistory is Spoke {

    struct PublishedPost
    {
        // neither of these need to be this big, but we should keep the total struct to 32 bytes
        uint80 postChainIndex; // pointer to the item in the ContentChain
        uint80 lowerChainIndex; // pointer to the item in the lowerFreqFeed
        uint96 publishedTime; // this can be used to pull in the votes
    } 

    PublishedPost[] public publishedHistory;

    function getPost(uint _publishedIndex)
    public view
    returns (uint postChainIndex_, uint lowerChainIndex_, uint publishedTime_)
    {
        return (
            uint(publishedHistory[_publishedIndex].postChainIndex), 
            uint(publishedHistory[_publishedIndex].lowerChainIndex), 
            uint(publishedHistory[_publishedIndex].publishedTime)
        );
    }

    function publishPost(uint _postChainIndex, uint _lowerChainIndex)
    public onlyHub
    returns (uint publishedIndex_)
    {
        PublishedPost memory newPublishedPost = PublishedPost(
        {
            postChainIndex: uint80(_postChainIndex),
            lowerChainIndex: uint80(_lowerChainIndex),
            publishedTime: uint96(now) 
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