pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

import './Ownable.sol';
import './ContentPool.sol';
import './PublishedHistory.sol';
import './Votes.sol';
import './DoxaToken.sol';
import './TransferGate.sol';

// switch tests and app to use ethjS

contract DoxaHub is TransferGate, Ownable {
  using SafeMath for uint256;

    ContentPool contentPool;
    PublishedHistory publishedHistory;
    Votes votes;
    DoxaToken token;

    uint public SUBMISSION_MINT = 1;
    uint public nextPublishTime;

    event LinkPosted(address indexed owner, uint256 backing, uint256 index, bytes32[8] link);
    event PostBacked(address indexed backer, uint32 indexed version, uint postIndex);
    event Published(uint indexed version, address indexed owner, bytes32[8] content);

    function DoxaHub(
        address _contentPool, 
        address _token, 
        address _publishedHistory, 
        address _votes)
    public 
    {
        contentPool = ContentPool(_contentPool);
        token = DoxaToken(_token);
        publishedHistory = PublishedHistory(_publishedHistory);
        votes = Votes(_votes);

        owner = msg.sender;
        // nextPublishTime = nextUTCMidnight(now);
        nextPublishTime = now + 1 hours;
    }

    function postLink(bytes32[8] link)
    public 
    {
        require(postingAvailable(msg.sender));
        contentPool.newContent(msg.sender, link);
        token.mint(msg.sender, SUBMISSION_MINT);
        LinkPosted(msg.sender, 0, contentPool.poolLength() - 1, link);
    }

    function postingAvailable(address _owner)
    view public
    returns (bool) {
        return (contentPool.outgoingPosts(_owner) < 1);
    }

    function getLinkByIndex( uint256 index ) 
    public view 
    returns( uint256, address owner, bytes32[8] link, uint256 backing )
    {
        var (poster, content) = contentPool.getItem(index);
        bytes32 postKey = keccak256(contentPool.currentVersion(), index);
        return (index, poster, content, votes.incomingVotes(postKey));
    }
    
    function getLinkCount() 
    public view
    returns (uint)
    {
        return contentPool.poolLength();
    }

    function backPost(uint256 _postIndex)
    public
    {
        require(_postIndex >= 0 && _postIndex < contentPool.poolLength() );
        require(votingAvailable(msg.sender));

        bytes32 ownerKey = keccak256(contentPool.currentVersion(), msg.sender);
        bytes32 postKey = keccak256(contentPool.currentVersion(), _postIndex);

        votes.addVote(ownerKey, postKey);
        PostBacked(msg.sender, contentPool.currentVersion(), _postIndex);
    }

    function totalPostBacking(uint256 _index)
    view public 
    returns (uint256) {
        bytes32 postKey = keccak256(contentPool.currentVersion(), _index);
        return votes.incomingVotes(postKey);
    }

    function votingAvailable(address _owner)
    view public
    returns (bool) {
        bytes32 ownerKey = keccak256(contentPool.currentVersion(), _owner);
        return (votes.outgoingVotes(ownerKey) < 1);
    }

    function availableToTransfer(address _owner, address _receiver)
    view public 
    returns (uint256) {
        // token cannot be transferred yet
        // later, we will add the ability to sell token back to the contract
        // later, we will add the ability to transfer token to staked accounts
        return 0;
        // bytes32 ownerKey = keccak256(contentPool.currentVersion(), _owner);
        // // can't transfer token if they are alreaddy voted in this cycle
        // return token.balanceOf(_owner).sub(votes.outgoingVotes(ownerKey));
    }

    function balanceOf(address _owner)
    view public
    returns (uint256) {
        return token.balanceOf(_owner);
    }

    function publish() 
    public 
    {
        // require(now > nextPublishTime);
        uint maxVotes = 0;
        uint indexToPublish = 0;
        bool somethingSelected = false;
        uint32 currentVersion = contentPool.currentVersion();

        for (uint i = 0; i < contentPool.poolLength(); i++) {
            bytes32 postKey = keccak256(currentVersion, i);
            if (!somethingSelected || votes.incomingVotes(postKey) > maxVotes) {
                maxVotes = votes.incomingVotes(postKey);
                indexToPublish = i;
                somethingSelected = true;
            }
        }
        if(somethingSelected) {
            publishedHistory.publish(currentVersion, indexToPublish);
            var (poster, content) = contentPool.getPastItem(currentVersion, indexToPublish);
            token.mint(poster, 1);
            Published(currentVersion, poster, content);
        }
        contentPool.clear();
        nextPublishTime = now + 1 hours;
        // nextPublishTime = nextUTCMidnight(now);
    }

    function currentVersion() 
    public view
    returns (uint32)
    {
        return contentPool.currentVersion();
    }

    function publishedIndex()
    public view
    returns (uint32)
    {
        return publishedHistory.publishedIndex();
    }

    function getVersion(uint32 version)
    public view
    returns (uint)
    {
        return publishedHistory.blockLength(version);
    }

    function getPublishedItem(uint32 publishedIndex) 
    public view
    returns (address poster_, bytes32[8] content_, uint publishedTime_)
    {
        var (version, poolIndex, publishedTime) = publishedHistory.getItem(publishedIndex);
        // now we need to convert publishedIndex to version
        var (poster, content) = contentPool.getPastItem(version, poolIndex);
        return (poster, content, publishedTime);
        // return (contentPool.getPastItem(version, poolIndex), publishedTime);
    }

    function getPublishedCoords(uint32 publishedIndex) 
    public view
    returns (uint32 version, uint index, uint publishedTime_)
    {
        return publishedHistory.getItem(publishedIndex);
    }

    // ========================= Helpers =================================

    function nextUTCMidnight(uint timestamp)
    public pure
    returns (uint)
    {
        return (timestamp / 1 days) * 1 days + 1 days;
    }
}