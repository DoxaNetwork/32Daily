pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

import './Ownable.sol';
import './PostChain.sol';
import './PublishedHistory.sol';
import './Votes.sol';
import './DoxaToken.sol';
import './TransferGate.sol';
import './PostChainAbstract.sol';


contract DoxaHub is PostChainAbstract, TransferGate, Ownable {
  using SafeMath for uint;

    PostChain postChain;
    PublishedHistory publishedHistory;
    Votes votes;
    DoxaToken token;

    uint8 public SUBMISSION_MINT = 1;
    uint96 public nextPublishTime;
    uint152 public nextPublishStartIndex;
    // could store top for free

    event NewPost(address indexed owner, bytes32 ipfsHash);
    event PostBacked(address indexed backer, uint postIndex);
    event Published(address indexed owner, uint index);

    constructor(
        address _postChain, 
        address _token, 
        address _publishedHistory, 
        address _votes)
    public 
    {
        postChain = PostChain(_postChain);
        token = DoxaToken(_token);
        publishedHistory = PublishedHistory(_publishedHistory);
        votes = Votes(_votes);

        owner = msg.sender;
        // nextPublishTime = nextUTCMidnight(now);
        nextPublishTime = uint96(now + 30 seconds);
        nextPublishStartIndex = 0;
    }

    function newPost(bytes32 _ipfsHash)
    public 
    {
        postChain.newPost(msg.sender, _ipfsHash);
        token.mint(msg.sender, uint(SUBMISSION_MINT));
        emit NewPost(msg.sender, _ipfsHash);
    }

    function getSubmittedItem(uint _index, uint _chainIndex) 
    public view 
    returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeIn_)
    {
        (address poster, bytes32 ipfsHash, uint publishedTime) = postChain.getPost(_index);
        uint votesReceived = votes.incomingVotes(_index, 0);
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
        (chainAddress, lowerChainIndex_, timeOut_) = publishedHistory.getPost(_publishedIndex);
        // (postChainIndex_, chainIndex_, lowerPublishedIndex, timeOut_) = publishedHistory.getPost(_publishedIndex);
        (poster_, ipfsHash_, postedTime) = postChain.getPost(lowerChainIndex_);
        votesReceived_ = votes.incomingVotes(lowerChainIndex_, 0);
        // which index should this return?
        return (_publishedIndex, poster_, ipfsHash_, votesReceived_, timeOut_);
    }


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

    // function getPublishedPointer(uint _publishedIndex)
    // public view
    // returns (uint postChainIndex_, uint chainIndex_, uint publishedTime_)
    // {
    //     uint lowerChainIndex;
    //     (postChainIndex_, chainIndex_, lowerChainIndex, publishedTime_) = publishedHistory.getPost(_publishedIndex);
    // }

    function backPost(uint _postIndex, uint _chainIndex)
    public
    {
        // can't vote on items that don't exist
        // PROBLEM: you can currently vote on items in the next block 
        (uint lower, uint upper) = range(0);
        require(_postIndex >= lower && _postIndex < upper );
        require( votingAvailable(msg.sender) );

        bytes32 voterCycleKey = keccak256(abi.encodePacked(msg.sender, nextPublishTime));
        votes.addVote(_postIndex, 0, voterCycleKey);
        emit PostBacked(msg.sender, _postIndex);

        // emit PostBacked(msg.sender, _ipfsHash, nextPublishTime);
    }

    function votingAvailable(address _voter)
    public view
    returns (bool) {
        bytes32 voterCycleKey = keccak256(abi.encodePacked(_voter, nextPublishTime));
        return (votes.outgoingVotesThisCycle(voterCycleKey) < 1);
    }

    function availableToTransfer(address _owner, address _receiver)
    public view
    returns (uint) {
        // token cannot be transferred yet
        // later, we will add the ability to sell token back to the contract
        // later, we will add the ability to transfer token to staked accounts
        return 0;
        // bytes32 ownerKey = keccak256(contentPool.currentVersion(), _owner);
        // // can't transfer token if they are alreaddy voted in this cycle
        // return token.balanceOf(_owner).sub(votes.outgoingVotes(ownerKey));
    }

    function publishedLength()
    public view
    returns (uint)
    {
        return publishedHistory.length();
    }

    function range(uint _chainIndex)
    public view
    returns (uint lower, uint upper)
    {
        return (nextPublishStartIndex, postChain.length());
    }

    function publish() 
    public 
    {
        require(now > uint(nextPublishTime));
        uint maxVotes = 0;
        uint indexToPublish = 0;
        bool somethingSelected = false;
        uint endIndex = postChain.length();

        for (uint postIndex = uint(nextPublishStartIndex); postIndex < endIndex; postIndex++) {
            uint votesForThisIndex = votes.incomingVotes(postIndex, 0);
            if (!somethingSelected || votesForThisIndex > maxVotes) {
                maxVotes = votesForThisIndex;
                indexToPublish = postIndex;
                somethingSelected = true;
            }
        }
        if (somethingSelected) {
            //                                     position in original chain    position in voting chain
            // option 1 - get rid of first indexToPublish by duplicating poster and ipfsHash (2 words)
            // option 2 - post chainAddress, chainIndex, voteIndex (1 word )
            // (chainAddress, lowerPublishedIndex, timeOut_) = publishedHistory.getPost(_publishedIndex);
            uint publishedIndex = publishedHistory.publishPost(address(postChain), indexToPublish);
            (address poster, bytes32 ipfsHash, uint postedTime) = postChain.getPost(indexToPublish); // need this to know where to send the token
            token.mint(poster, 1);
            emit Published(poster, publishedIndex);
            // Published(publishedIndex); // this is enough for clients to grab the rest
        }
        nextPublishTime = uint96(now + 30 seconds);
        nextPublishStartIndex = uint152(endIndex);
    }

    // ========================= Helpers =================================

    function nextUTCMidnight(uint timestamp)
    public pure
    returns (uint)
    {
        return (timestamp / 1 days) * 1 days + 1 days;
    }
}