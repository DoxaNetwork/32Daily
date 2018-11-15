pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './PostChain.sol';
import './PublishedHistory.sol';
import './Votes.sol';
import './DoxaToken.sol';
import './PostChainAbstract.sol';


contract DoxaHub is PostChainAbstract, Ownable {
  using SafeMath for uint;

    PublishedHistory public publishedHistory;
    Votes public votes;
    DoxaToken public doxaToken;
    address public developmentFund;

    uint public period;
    uint public nextPublishTime;
    uint public publishMint;
    uint public publishDevMint;

    struct Chain {
        PostChainAbstract chainContract;
        uint96 startIndex;
    }
    Chain[] public chains;

    event NewPost(address indexed owner, bytes32 ipfsHash, uint index);
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
        developmentFund = tx.origin;
        period = _period * 1 hours;
        publishMint = _period * 10**18;
        publishDevMint = publishMint / 5;
        nextPublishTime = topOfTheHour(now);
    }

    function setDevelopmentFund(address _newDevelopmentFund)
    public onlyOwner
    {
        developmentFund = _newDevelopmentFund;
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
    returns (uint postChainIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint publishedTime_, address[4] approvedChains_)
    {
        PostChainAbstract chain = chains[_chainIndex].chainContract;
        uint approvedCount;
        (poster_, ipfsHash_, publishedTime_, approvedChains_, approvedCount) = chain.getPost(_index);
        uint votesReceived = votes.incomingVotes(_index, chain);
        return (_index, poster_, ipfsHash_, votesReceived, publishedTime_, approvedChains_);
    }

    function getPublishedItem(uint _publishedIndex) 
    public view
    returns (uint publishedIndex_, address poster_, bytes32 ipfsHash_, uint votesReceived_, uint timeOut_)
    {
        uint lowerChainIndex;
        uint postedTime;
        address chainAddress;
        address[4] memory approvedChains_;
        uint approvedCount;
        (chainAddress, lowerChainIndex, timeOut_) = publishedHistory.getPost(_publishedIndex);
        PostChainAbstract chain = PostChainAbstract(chainAddress);
        (poster_, ipfsHash_, postedTime, approvedChains_, approvedCount) = chain.getPost(lowerChainIndex);
        votesReceived_ = votes.incomingVotes(lowerChainIndex, chainAddress);
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
        (address poster, bytes32 ipfsHash, uint timeStamp, address[4] memory approvedChains_, uint approvedCount) = chain.getPost(indexToPublish);

        uint publishedIndex = publishedHistory.publishPost(chain, indexToPublish);

        doxaToken.mint(poster, publishMint);
        doxaToken.mint(developmentFund, publishDevMint);
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

        nextPublishTime = nextPublishTime + period;
    }

    function topOfTheHour(uint timestamp)
    public pure
    returns (uint)
    {
        return (timestamp / 1 hours) * 1 hours + 1 hours;
    }

    function backPost(uint _postIndex, uint _chainIndex)
    public
    {
        // can't vote on items that don't exist
        // PROBLEM: you can currently vote on items in the next block 
        (uint lower, uint upper) = range(_chainIndex);
        require(_postIndex >= lower && _postIndex < upper );

        votes.addVote(msg.sender, _postIndex, nextPublishTime, chains[_chainIndex].chainContract);
        emit PostBacked(msg.sender, _postIndex);
    }

    function newPost(bytes32 _ipfsHash)
    public 
    {
        uint index = PostChain(chains[0].chainContract).newPost(msg.sender, _ipfsHash);
        emit NewPost(msg.sender, _ipfsHash, index);
    }

    function getPost(uint _publishedIndex)
    public view
    returns (address poster_, bytes32 ipfsHash_, uint timeStamp_, address[4] approvedLowerChains_, uint approvedChainsCount_)
    {
        (address chainAddress, uint lowerPublishedIndex, uint timeOut) = publishedHistory.getPost(_publishedIndex);
        PostChainAbstract postChain = PostChainAbstract(chainAddress); // this could be a branch or a leaf
        (poster_, ipfsHash_, timeStamp_, approvedLowerChains_, approvedChainsCount_) = postChain.getPost(lowerPublishedIndex);
        approvedLowerChains_[approvedChainsCount_] = this;
        approvedChainsCount_ += 1;
        return (poster_, ipfsHash_, timeStamp_, approvedLowerChains_, approvedChainsCount_);
    }

    function length()
    public view
    returns (uint)
    {
        return publishedHistory.length();
    }
}