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
    PostChain public sideChain;
    DoxaToken public doxaToken; 

    event PostBacked(address indexed backer, uint postIndex);
    event Published(address indexed owner, uint index);
    event NewPost(address indexed owner, bytes32 ipfsHash);
    

    uint public nextPublishTime;
    uint public nextPublishStartIndex;
    uint public nextSidePublishStartIndex;
    uint public nextPublishEndIndex;

    uint period;

    function HigherFreq(
        uint _period, 
        address _lowerFreq, 
        address _votes, 
        address _publishedHistory,
        address _postChain,
        address _sideChain,
        address _doxaToken)
    public
    {
        lowerFreq = DoxaHub(_lowerFreq);
        votes = Votes(_votes); // independent for this freq
        publishedHistory = PublishedHistory(_publishedHistory); // independent for this freq
        postChain = PostChain(_postChain); // shared between all freqs
        sideChain = PostChain(_sideChain); // unique to this freq
        doxaToken = DoxaToken(_doxaToken); // independent?

        nextPublishStartIndex = 0;
        nextSidePublishStartIndex = 0;
        // nextPublishEndIndex = 0;
        period = _period;
        nextPublishTime = now + 60 seconds;
    }

    function newPost(bytes32 _ipfsHash)
    public 
    {
        sideChain.newPost(msg.sender, _ipfsHash);
        doxaToken.mint(msg.sender, uint(1));
        emit NewPost(msg.sender, _ipfsHash);
    }

    // this is lowerfreq.publishedIndex
    function backPost(uint _postIndex, uint _chainIndex) 
    public 
    {
        if (_chainIndex == 0 ) {
            backLowerChainPost(_postIndex);
        }
        if (_chainIndex == 1) {
            backSideChainPost(_postIndex);
        }
        // (uint lower, uint upper) = range();
        // require(_postIndex >= lower && _postIndex < upper );
        // require( votingAvailable(msg.sender) );

        // bytes32 voterCycleKey = keccak256(abi.encodePacked(msg.sender, nextPublishTime));
        // votes.addVote(_postIndex, 0, voterCycleKey);
        // emit PostBacked(msg.sender, _postIndex, 0);
    }

    function backSideChainPost(uint _postIndex)
    public
    {
        (uint lower, uint upper) = sideRange();
        require(_postIndex >= lower && _postIndex < upper );
        require( votingAvailable(msg.sender) );

        bytes32 voterCycleKey = keccak256(abi.encodePacked(msg.sender, nextPublishTime));
        votes.addVote(_postIndex, 1, voterCycleKey);
        emit PostBacked(msg.sender, _postIndex);
    }

    function backLowerChainPost(uint _postIndex)
    public
    {
        (uint lower, uint upper) = range();
        require(_postIndex >= lower && _postIndex < upper );
        require( votingAvailable(msg.sender) );

        bytes32 voterCycleKey = keccak256(abi.encodePacked(msg.sender, nextPublishTime));
        votes.addVote(_postIndex, 0, voterCycleKey);
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

    function sideRange()
    public view
    returns (uint lower, uint uppper)
    {
        return (nextSidePublishStartIndex, sideChain.length());
    }

    // instead of _chainIndex, we should probably use _chainAddress
    // nvm, index will be less data to store - just a little more complex with a necessary mapping
    function getSubmittedItem(uint _lowerFreqPublishedIndex, uint _chainIndex) 
    public view 
    returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeIn_)
    {
        if (_chainIndex == 0) {
            uint postChainIndex;
            uint chainIndex;
            uint votesReceivedLower;
            (postChainIndex, chainIndex, poster_, ipfsHash_, votesReceivedLower, timeIn_) = lowerFreq.getPublishedItem(_lowerFreqPublishedIndex);
            votesReceived_ = votes.incomingVotes(_lowerFreqPublishedIndex, _chainIndex);
            return (postChainIndex, poster_, ipfsHash_, votesReceived_, timeIn_);
        } else {
            (poster_, ipfsHash_, timeIn_) = sideChain.getPost(_lowerFreqPublishedIndex);
            votesReceived_ = votes.incomingVotes(_lowerFreqPublishedIndex, _chainIndex);
            return (_lowerFreqPublishedIndex, poster_, ipfsHash_, votesReceived_, timeIn_);
        }
    }

    // // same as DoxaHub
    // function getPublishedItem(uint _publishedIndex)
    // public view
    // returns (uint postChainIndex_, uint chainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeOut_)
    // {
    //     (uint postChainIndex, uint chainIndex, uint lowerChainIndex, uint publishedTime) = publishedHistory.getPost(_publishedIndex);
    //     uint votesReceived = votes.incomingVotes(lowerChainIndex, chainIndex);
    //     (address poster, bytes32 ipfsHash, uint postedTime) = postChain.getPost(postChainIndex);
    //     return (postChainIndex, chainIndex, poster, ipfsHash, votesReceived, publishedTime);
    // }

    function getPublishedItem(uint _publishedIndex) 
    public view
    returns (uint postChainIndex_, uint chainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeOut_)
    {
        // postChainIndex can be used to find who voted for this
        uint lowerPublishedIndex;
        uint postedTime;
        uint timeIn;
        (postChainIndex_, chainIndex_, lowerPublishedIndex, timeOut_) = publishedHistory.getPost(_publishedIndex);
        if (chainIndex_ == 0) {
            (poster_, ipfsHash_, postedTime) = postChain.getPost(postChainIndex_);
        } else {
            (poster_, ipfsHash_, timeIn) = sideChain.getPost(postChainIndex_);
        }
        votesReceived_ = votes.incomingVotes(postChainIndex_, chainIndex_);
        // which index should this return?
        return (postChainIndex_, chainIndex_, poster_, ipfsHash_, votesReceived_, timeOut_);
    }

    function getPublishedPointer(uint _publishedIndex)
    public view
    returns (uint postChainIndex_, uint chainIndex_, uint publishedTime_)
    {
        uint lowerChainIndex;
        (postChainIndex_, chainIndex_, lowerChainIndex, publishedTime_) = publishedHistory.getPost(_publishedIndex);
    }

    function getMaxForChain(uint _chainIndex, uint _start, uint _end)
    public view 
    returns (uint indexToPublish, uint maxVotes_, bool somethingSelected_)
    {
        // uint maxVotes = 0;
        bool somethingSelected = false;
        for (uint postIndex = _start; postIndex < _end; postIndex++) {
            uint votesForThisIndex = votes.incomingVotes(postIndex, _chainIndex);
            if (!somethingSelected || votesForThisIndex > maxVotes_) {
                maxVotes_ = votesForThisIndex;
                indexToPublish = postIndex;
                somethingSelected = true;
            }
        }
        return (indexToPublish, maxVotes_, somethingSelected);
    }

    function publishChain0(uint indexToPublish)
    public
    {
        // its trying to post from the semidaily side chain but its grabbing from the hourly main chain instead
        (uint postChainIndex, uint chainIndex, uint publishedTime) = lowerFreq.getPublishedPointer(indexToPublish);
        (address poster, bytes32 ipfsHash, uint timeStamp) = postChain.getPost(postChainIndex);

        uint publishedIndex = publishedHistory.publishPost(postChainIndex, 0, indexToPublish);
        doxaToken.mint(poster, 1);
        emit Published(poster, publishedIndex);
    }

    function publishChain1(uint postChainIndex)
    public
    {
        (address poster, bytes32 ipfsHash, uint timeStamp) = sideChain.getPost(postChainIndex);
        uint publishedIndex = publishedHistory.publishPost(postChainIndex, 1, postChainIndex);
        doxaToken.mint(poster, 1);
        emit Published(poster, publishedIndex);
    }

    function publish()
    public 
    {
        require(now > nextPublishTime);

        (uint index0, uint max0, bool somethingSelected0) = getMaxForChain(0, nextPublishStartIndex, lowerFreq.publishedLength());
        (uint index1, uint max1, bool somethingSelected1) = getMaxForChain(1, nextSidePublishStartIndex, sideChain.length());


        // both are selected. 0 wins the tie
        if (somethingSelected0 && somethingSelected1) {
            if ( max1 > max0) {
                publishChain1(index1);
            } else {
                publishChain0(index0);
            }
        } else if (somethingSelected0) {
            publishChain0(index0);
        } else if (somethingSelected1) {
            publishChain1(index1);
        }
        // A - nothing selected in both - publlish nothing

        // B - one is selected - publish that one 

        // C - both are selected - publish highest
        // if ( max1 > max0 && somethingSelected1) { // what if they are both zero?
        //     publishChain1(index1);
        // } else if(somethingSelected0) {
        //     publishChain0(index0);
        // }

        // uint maxVotes = 0;
        // uint indexToPublish = 0;
        // uint chainToPublish = 0;
        // bool somethingSelected = false;
        // uint endIndex = lowerFreq.publishedLength(); // should this be lowerFreq.published.length?
        // uint endIndexSide = sideChain.length(); // should this be lowerFreq.published.length?

        // for (uint postIndex = uint(nextPublishStartIndex); postIndex < endIndex; postIndex++) {
        //     uint votesForThisIndex1 = votes.incomingVotes(postIndex, 0);
        //     if (!somethingSelected || votesForThisIndex1 > maxVotes) {
        //         maxVotes = votesForThisIndex1;
        //         indexToPublish = postIndex;
        //         chainToPublish = 0;
        //         somethingSelected = true;
        //     }
        // }

        // for (uint postIndex2 = uint(nextSidePublishStartIndex); postIndex2 < endIndexSide; postIndex2++) {
        //     uint votesForThisIndex2 = votes.incomingVotes(postIndex2, 1);
        //     if (!somethingSelected || votesForThisIndex2 > maxVotes) {
        //         maxVotes = votesForThisIndex2;
        //         indexToPublish = postIndex2;
        //         chainToPublish = 1;
        //         somethingSelected = true;
        //     }
        // }

        // if (somethingSelected) {

        //     // this is the only line that is substantially different 
        //     // need that postChainIndex
        //     uint postChainIndex;
        //     uint chainIndex__;
        //     uint publishedTime__;
        //     if (chainToPublish == 0) {
        //         (postChainIndex, chainIndex__, publishedTime__) = lowerFreq.getPublishedPointer(indexToPublish);
        //     }
        //     if (chainToPublish == 1) {
        //         postChainIndex = indexToPublish;
        //     }

        //     address poster;
        //     bytes32 ipfsHash__;
        //     uint timeStamp__;
        //     if (chainToPublish == 0) {
        //         (poster, ipfsHash__, timeStamp__) = postChain.getPost(postChainIndex);
        //     }
        //     if (chainToPublish == 1) {
        //         (poster, ipfsHash__, timeStamp__) = sideChain.getPost(postChainIndex);
        //     }

        //     uint publishedIndex = publishedHistory.publishPost(postChainIndex, chainToPublish, indexToPublish);
        //     doxaToken.mint(poster, 1);
        //     emit Published(poster, publishedIndex);
        // }

        nextPublishStartIndex = lowerFreq.publishedLength();
        nextSidePublishStartIndex = sideChain.length();
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