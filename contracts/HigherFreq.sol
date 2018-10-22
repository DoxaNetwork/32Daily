pragma solidity ^0.4.24;

import './DoxaHub.sol';
import './DoxaToken.sol';
import './Votes.sol';
import './PublishedHistory.sol';
import './PostChain.sol';
import './TransferGate.sol';
import './PostChainAbstract.sol';

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
        (uint lower, uint upper) = range(_chainIndex);
        require(_postIndex >= lower && _postIndex < upper );
        require( votingAvailable(msg.sender) );

        bytes32 voterCycleKey = keccak256(abi.encodePacked(msg.sender, nextPublishTime));

        votes.addVote(_postIndex, _chainIndex, voterCycleKey);
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
    function range(uint _chainIndex) 
    public view
    returns (uint lower, uint upper)
    {
        if (_chainIndex == 0 ) {
            return (nextPublishStartIndex, lowerFreq.publishedLength());
        }
        if (_chainIndex == 1) {
            return (nextSidePublishStartIndex, sideChain.length());
        }
    }

    // instead of _chainIndex, we should probably use _chainAddress
    // nvm, index will be less data to store - just a little more complex with a necessary mapping
    // function getSubmittedItem(uint _lowerFreqPublishedIndex, uint _chainIndex) 
    // public view 
    // returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeIn_)
    // {
    //     if (_chainIndex == 0) {
    //         uint postChainIndex;
    //         uint chainIndex;
    //         uint votesReceivedLower;
    //         (postChainIndex, chainIndex, poster_, ipfsHash_, votesReceivedLower, timeIn_) = lowerFreq.getPublishedItem(_lowerFreqPublishedIndex);
    //         votesReceived_ = votes.incomingVotes(_lowerFreqPublishedIndex, _chainIndex);
    //         return (postChainIndex, poster_, ipfsHash_, votesReceived_, timeIn_);
    //     } else {
    //         (poster_, ipfsHash_, timeIn_) = sideChain.`(_lowerFreqPublishedIndex);
    //         votesReceived_ = votes.incomingVotes(_lowerFreqPublishedIndex, _chainIndex);
    //         return (_lowerFreqPublishedIndex, poster_, ipfsHash_, votesReceived_, timeIn_);
    //     }
    // }
    function getPost(uint _publishedIndex)
    public view
    returns (address poster_, bytes32 ipfsHash_, uint timeStamp_)
    {
        address chainAddress;
        uint lowerPublishedIndex;
        uint timeOut_;
        (chainAddress, lowerPublishedIndex, timeOut_) = publishedHistory.getPost(_publishedIndex);
        postChain = PostChain(chainAddress); // this could be a branch or a leaf
        return postChain.getPost(lowerPublishedIndex);
    }

    function getSubmittedItem(uint _index, uint _chainIndex) 
    public view 
    returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeIn_)
    {
        PostChainAbstract chain;
        if (_chainIndex == 0) {
            chain = lowerFreq;
        } else {
            chain = sideChain;
        }
        (address poster, bytes32 ipfsHash, uint publishedTime) = chain.getPost(_index);
        uint votesReceived = votes.incomingVotes(_index, _chainIndex);
        return (_index, poster, ipfsHash, votesReceived, publishedTime);
    }

    function getPublishedItem(uint _publishedIndex) 
    public view
    returns (uint publishedIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeOut_)
    {
        // postChainIndex can be used to find who voted for this
        uint lowerChainIndex_;
        uint postedTime;
        address chainAddress;
        uint chainIndex;
        (chainAddress, lowerChainIndex_, timeOut_) = publishedHistory.getPost(_publishedIndex);
        PostChainAbstract chain = PostChain(chainAddress);
        // (postChainIndex_, chainIndex_, lowerPublishedIndex, timeOut_) = publishedHistory.getPost(_publishedIndex);
        (poster_, ipfsHash_, postedTime) = chain.getPost(lowerChainIndex_);
        // dont have index
        if (chainAddress == address(lowerFreq) ) {
            chainIndex = 0;
        }
        if (chainAddress == address(sideChain)) {
            chainIndex = 1;
        }
        votesReceived_ = votes.incomingVotes(lowerChainIndex_, chainIndex);
        // which index should this return?
        return (publishedIndex_, poster_, ipfsHash_, votesReceived_, timeOut_);
    }

    // function getPublishedItem(uint _publishedIndex) 
    // public view
    // returns (uint postChainIndex_, uint chainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeOut_)
    // {
    //     // postChainIndex can be used to find who voted for this
    //     uint lowerPublishedIndex;
    //     uint postedTime;
    //     uint timeIn;
    //     (postChainIndex_, chainIndex_, lowerPublishedIndex, timeOut_) = publishedHistory.getPost(_publishedIndex);
    //     if (chainIndex_ == 0) {
    //         (poster_, ipfsHash_, postedTime) = postChain.getPost(postChainIndex_);
    //     } else {
    //         (poster_, ipfsHash_, timeIn) = sideChain.getPost(postChainIndex_);
    //     }
    //     votesReceived_ = votes.incomingVotes(postChainIndex_, chainIndex_);
    //     // which index should this return?
    //     return (postChainIndex_, chainIndex_, poster_, ipfsHash_, votesReceived_, timeOut_);
    // }

    // function getPublishedPointer(uint _publishedIndex)
    // public view
    // returns (uint postChainIndex_, uint chainIndex_, uint publishedTime_)
    // {
    //     uint lowerChainIndex;
    //     (postChainIndex_, chainIndex_, lowerChainIndex, publishedTime_) = publishedHistory.getPost(_publishedIndex);
    // }

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

    // function publishChain0(uint indexToPublish)
    // public
    // {
    //     (uint postChainIndex, uint chainIndex, uint publishedTime) = lowerFreq.getPublishedPointer(indexToPublish);
    //     (address poster, bytes32 ipfsHash, uint timeStamp) = postChain.getPost(postChainIndex);
    //     (address poster, bytes32 ipfsHash, uint timeStamp) = lowerFreq.getPost(postChainIndex);

    //     uint publishedIndex = publishedHistory.publishPost(postChainIndex, 0, indexToPublish);
    //     doxaToken.mint(poster, 1);
    //     emit Published(poster, publishedIndex);
    // }

    function publishChain(uint indexToPublish, uint _chainIndex)
    public
    {
        // if (_chainIndex == 0) {
            // (uint postChainIndex, uint chainIndex, uint publishedTime) = lowerFreq.getPublishedPointer(indexToPublish);
        // }
        // (address poster, bytes32 ipfsHash, uint timeStamp) = sideChain.getPost(postChainIndex);
        PostChainAbstract chain;
        if (_chainIndex == 0) {
            chain = lowerFreq;
        } else {
            chain = sideChain;
        }

        (address poster, bytes32 ipfsHash, uint timeStamp) = chain.getPost(indexToPublish); // this needs to work for both the postChain and the lowerFreq

        uint publishedIndex = publishedHistory.publishPost(address(chain), indexToPublish);

        // uint publishedIndex = publishedHistory.publishPost(indexToPublish, 1, indexToPublish); // I don't like how we publish two indexes, but perhaps it is necessary 
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
                publishChain(index1, 1);
            } else {
                publishChain(index0, 0);
            }
        } else if (somethingSelected0) {
            publishChain(index0, 0);
        } else if (somethingSelected1) {
            publishChain(index1, 1);
        }

        // need one of these for every chain
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