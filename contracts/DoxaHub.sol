pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './PostChain.sol';
import './PublishedHistory.sol';
import './Votes.sol';
import './DoxaToken.sol';
import './TransferGate.sol';
import './PostChainAbstract.sol';


contract DoxaHub is PostChainAbstract, TransferGate, Ownable {
  using SafeMath for uint;

    PublishedHistory public publishedHistory;
    Votes public votes;
    DoxaToken public doxaToken;

    uint128 public nextPublishTime;
    uint128 public period;

    struct Chain {
        PostChainAbstract chainContract;
        uint96 startIndex;
    }
    Chain[] public chains;
    // could store top for free

    event NewPost(address indexed owner, bytes32 ipfsHash);
    event PostBacked(address indexed backer, uint postIndex);
    event Published(address indexed owner, uint index);

    constructor(
        uint _period,
        address _token, 
        address _postChain, 
        address _votes,
        address _publishedHistory) 
    public 
    {
        addChain(_postChain);
        doxaToken = DoxaToken(_token);
        publishedHistory = PublishedHistory(_publishedHistory);
        votes = Votes(_votes);

        owner = msg.sender;
        period = uint128(_period);
        nextPublishTime = uint128(now + period * 1 seconds);
    }
    function addChain(address _chainAddress)
    public 
    {
        Chain memory newChain = Chain(
        {
            chainContract: PostChainAbstract(_chainAddress),
            startIndex: 0
        });

        chains.push(newChain);
    }

    function getSubmittedItem(uint _index, uint _chainIndex) 
    public view 
    returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeIn_)
    {
        PostChainAbstract chain = chains[_chainIndex].chainContract;
        (address poster, bytes32 ipfsHash, uint publishedTime) = chain.getPost(_index);
        uint votesReceived = votes.incomingVotes(_index, chain);
        return (_index, poster, ipfsHash, votesReceived, publishedTime);
    }

    function getPublishedItem(uint _publishedIndex) 
    public view
    returns (uint publishedIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeOut_)
    {
        uint lowerChainIndex_;
        uint postedTime;
        address chainAddress;
        (chainAddress, lowerChainIndex_, timeOut_) = publishedHistory.getPost(_publishedIndex);
        PostChainAbstract chain = PostChainAbstract(chainAddress);
        (poster_, ipfsHash_, postedTime) = chain.getPost(lowerChainIndex_);
        votesReceived_ = votes.incomingVotes(lowerChainIndex_, chainAddress);
        return (_publishedIndex, poster_, ipfsHash_, votesReceived_, timeOut_);
    }

    function range(uint _chainIndex) 
    public view
    returns (uint lower, uint upper)
    {
        return (chains[_chainIndex].startIndex, chains[_chainIndex].chainContract.length());
    }

    function getMaxForChain(uint _chainIndex)
    public 
    returns (uint indexToPublish, uint maxVotes_, bool somethingSelected_)
    {
        (uint start, uint end) = range(_chainIndex);
        bool somethingSelected = false;
        for (uint postIndex = start; postIndex < end; postIndex++) {
            uint votesForThisIndex = votes.incomingVotes(postIndex, chains[_chainIndex].chainContract);
            if (!somethingSelected || votesForThisIndex > maxVotes_) {
                maxVotes_ = votesForThisIndex;
                indexToPublish = postIndex;
                somethingSelected = true;
            }
        }
        chains[_chainIndex].startIndex = uint96(chains[_chainIndex].chainContract.length());
        return (indexToPublish, maxVotes_, somethingSelected);
    }

    function publishChain(uint indexToPublish, uint _chainIndex)
    public
    {
        PostChainAbstract chain = chains[_chainIndex].chainContract;
        (address poster, bytes32 ipfsHash, uint timeStamp) = chain.getPost(indexToPublish); // this needs to work for both the postChain and the lowerFreq

        uint publishedIndex = publishedHistory.publishPost(chain, indexToPublish);

        doxaToken.mint(poster, 1);
        emit Published(poster, publishedIndex);
    }

    function publish()
    public 
    {
        require(now > nextPublishTime);

        uint max = 0;
        uint indexToPublish;
        uint chainIndexToPublish;
        bool somethingSelected;
        for(uint i = 0; i < chains.length; i++) {
            (uint indexMax, uint chainMax, bool chainSomethingSelected) = getMaxForChain(i);
            // priority is given to higher index chains
            if (chainSomethingSelected && chainMax >= max) {
                max = chainMax;
                indexToPublish = indexMax;
                chainIndexToPublish = i;
                somethingSelected = true;
            }
        }

        if (somethingSelected) {
            publishChain(indexToPublish, chainIndexToPublish);
        }

        nextPublishTime = uint128(now + 60 seconds);
    }

    // ========================= Helpers =================================

    function nextUTCMidnight(uint timestamp)
    public pure
    returns (uint)
    {
        return (timestamp / 1 days) * 1 days + 1 days;
    }


    function backPost(uint _postIndex, uint _chainIndex)
    public
    {
        // can't vote on items that don't exist
        // PROBLEM: you can currently vote on items in the next block 
        (uint lower, uint upper) = range(_chainIndex);
        require(_postIndex >= lower && _postIndex < upper );
        require( votingAvailable(msg.sender) );

        votes.addVote(msg.sender, _postIndex, nextPublishTime, chains[_chainIndex].chainContract);
        emit PostBacked(msg.sender, _postIndex);
    }

function newPost(bytes32 _ipfsHash)
    public 
    {
        PostChain(chains[0].chainContract).newPost(msg.sender, _ipfsHash);
        doxaToken.mint(msg.sender, uint(1));
        emit NewPost(msg.sender, _ipfsHash);
    }

function votingAvailable(address _voter)
    public view
    returns (bool) {
        return (votes.outgoingVotesThisCycle(_voter, nextPublishTime) < 1);
    }

function getPost(uint _publishedIndex)
    public view
    returns (address poster_, bytes32 ipfsHash_, uint timeStamp_)
    {
        address chainAddress;
        uint lowerPublishedIndex;
        uint timeOut;
        (chainAddress, lowerPublishedIndex, timeOut) = publishedHistory.getPost(_publishedIndex);
        PostChainAbstract postChain = PostChainAbstract(chainAddress); // this could be a branch or a leaf
        return postChain.getPost(lowerPublishedIndex);
    }

function length()
    public view
    returns (uint)
    {
        return publishedHistory.length();
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
}