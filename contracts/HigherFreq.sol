pragma solidity ^0.4.24;

import './DoxaHub.sol';
import './DoxaToken.sol';
import './Votes.sol';
import './PublishedHistory.sol';
import './PostChain.sol';
import './TransferGate.sol';

contract HigherFreq is TransferGate {

    DoxaHub public lowerFreq;
    Votes public votes;
    PublishedHistory public publishedHistory;
    PostChain public postChain;
    DoxaToken public doxaToken; 

    event PostBacked(address indexed backer, uint postIndex);
    event Published(address indexed owner, uint index);
    

    uint public nextPublishTime;
    uint public nextPublishStartIndex;
    uint public nextPublishEndIndex;

    uint period;

    function HigherFreq(
        uint _period, 
        address _lowerFreq, 
        address _votes, 
        address _publishedHistory,
        address _postChain,
        address _doxaToken)
    public
    {
        lowerFreq = DoxaHub(_lowerFreq);
        votes = Votes(_votes); // independent for this freq
        publishedHistory = PublishedHistory(_publishedHistory); // independent for this freq
        postChain = PostChain(_postChain); // shared between all freqs
        doxaToken = DoxaToken(_doxaToken); // independent?

        nextPublishStartIndex = 0;
        nextPublishEndIndex = 0;
        period = _period;
        nextPublishTime = now + 60 seconds;
    }


    // this is lowerfreq.publishedIndex
    function backPost(uint _postIndex) 
    public 
    {
        (uint lower, uint upper) = range();
        require(_postIndex >= lower && _postIndex < upper );
        require( votingAvailable(msg.sender) );

        bytes32 voterCycleKey = keccak256(abi.encodePacked(msg.sender, nextPublishTime));
        votes.addVote(_postIndex, voterCycleKey);
        emit PostBacked(msg.sender, _postIndex);
    }

    // exact same as DoxaHub
    function votingAvailable(address _voter)
    public view
    returns (bool) {
        bytes32 voterCycleKey = keccak256(abi.encodePacked(_voter, nextPublishTime));
        return (votes.outgoingVotesThisCycle(voterCycleKey) < 1);
    }

    // almost the same on all 
    function range() 
    public view
    returns (uint lower, uint upper)
    {
        return (nextPublishStartIndex, lowerFreq.publishedLength());
    }

    function getSubmittedItem(uint _lowerFreqPublishedIndex) 
    public view 
    returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeIn_)
    {
        (uint postChainIndex, address poster, bytes32 ipfsHash, uint votesReceivedLower, uint publishedTimeLower) = lowerFreq.getPublishedItem(_lowerFreqPublishedIndex);
        uint votesReceived = votes.incomingVotes(_lowerFreqPublishedIndex);
        return (postChainIndex, poster, ipfsHash, votesReceived, publishedTimeLower);
    }

    // same as DoxaHub
    function getPublishedItem(uint _publishedIndex)
    public view
    returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeOut_)
    {
        (uint postChainIndex, uint lowerChainIndex, uint publishedTime) = publishedHistory.getPost(_publishedIndex);
        uint votesReceived = votes.incomingVotes(lowerChainIndex);
        (address poster, bytes32 ipfsHash, uint postedTime) = postChain.getPost(postChainIndex);
        return (postChainIndex, poster, ipfsHash, votesReceived, publishedTime);
    }

    function getPublishedPointer(uint _publishedIndex)
    public view
    returns (uint postChainIndex_, uint publishedTime_)
    {
        (uint postChainIndex, uint lowerChainIndex, uint publishedTime) = publishedHistory.getPost(_publishedIndex);
    }

    function publish()
    public 
    {
        require(now > nextPublishTime);

        uint maxVotes = 0;
        uint indexToPublish = 0;
        bool somethingSelected = false;
        uint endIndex = lowerFreq.publishedLength(); // should this be lowerFreq.published.length?

        for (uint postIndex = uint(nextPublishStartIndex); postIndex < endIndex; postIndex++) {
            uint votesForThisIndex = votes.incomingVotes(postIndex);
            if (!somethingSelected || votesForThisIndex > maxVotes) {
                maxVotes = votesForThisIndex;
                indexToPublish = postIndex;
                somethingSelected = true;
            }
        }
        if (somethingSelected) {

            // this is the only line that is substantially different 
            (uint postChainIndex, uint publishedTime) = lowerFreq.getPublishedPointer(indexToPublish);

            uint publishedIndex = publishedHistory.publishPost(postChainIndex, indexToPublish);
            (address poster, bytes32 ipfsHash, uint postedTime) = postChain.getPost(postChainIndex);
            doxaToken.mint(poster, 1);
            emit Published(publishedIndex, poster)
        }

        nextPublishStartIndex = lowerFreq.publishedLength();
        // nextPublishEndIndex = lowerFreq.publishedLength();
        nextPublishTime = now + 60 seconds;
    }

    function availableToTransfer(address _owner, address _receiver)
    view public 
    returns (uint256) {
        // token cannot be transferred yet
        // later, we will add the ability to sell token back to the contract
        // later, we will add the ability to transfer token to staked accounts
        return 0;
        // bytes32 ownerKey = keccak256(postChain.currentVersion(), _owner);
        // // can't transfer token if they are alreaddy voted in this cycle
        // return token.balanceOf(_owner).sub(votes.outgoingVotes(ownerKey));
    }

    // same as doxahub
    function publishedLength()
    public view
    returns (uint)
    {
        return publishedHistory.length();
    }
}