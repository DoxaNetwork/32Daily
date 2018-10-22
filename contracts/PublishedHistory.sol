pragma solidity ^0.4.24;

import './Spoke.sol';


contract PublishedHistory is Spoke {

    struct PublishedPost
    {
        // neither of these need to be this big, but we should keep the total struct to 32 bytes
        // uint64 postChainIndex; // pointer to the item in the ContentChain
        // uint64 chainIndex; // which chain this came from 
        // uint64 lowerChainIndex; // pointer to the item in the lowerFreqFeed, if this is from a lower feed
        // uint64 publishedTime; // this can be used to pull in the votes


        address chainAddress;
        uint64 lowerChainIndex; // index where it is posted
        uint64 publishedTime; // this can be used to pull in the votes
        // uint24 voteIndex; // 
    } 

    PublishedPost[] public publishedHistory;

    function getPost(uint _publishedIndex)
    public view
    returns (address chainAddress, uint lowerChainIndex_, uint publishedTime_)
    {
        return (
            publishedHistory[_publishedIndex].chainAddress, 
            uint(publishedHistory[_publishedIndex].lowerChainIndex), 
            uint(publishedHistory[_publishedIndex].publishedTime)
        );
    }

    // uint publishedIndex = publishedHistory.publishPost(address(postChain), indexToPublish);

    function publishPost(address _chainAddress, uint _lowerChainIndex)
    public onlyHub
    returns (uint publishedIndex_)
    {
        PublishedPost memory newPublishedPost = PublishedPost(
        {
            // postChainIndex: uint64(_postChainIndex),
            // chainIndex: uint64(_chainIndex),
            chainAddress: _chainAddress,
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