import './DoxaHub.sol';
import './DoxaToken.sol';
import './Votes.sol';
import './PublishedHistory.sol';
import './ContentPool.sol';
import './TransferGate.sol';

contract HigherFreq is TransferGate {

    DoxaHub public lowerFreq;
    Votes public votes;
    PublishedHistory public promotedContent;
    ContentPool public contentPool;
    DoxaToken public doxaToken; 

    // Votes freq2Votes;
    // PublishedHistory higherFreqPublishedHistory;
    event Published(uint indexed version, address indexed owner, bytes32[8] content);
    

    // public uint nextCycleChange;
    uint public currentCycle;
    uint32 lowerPublishedIndex;
    uint32 upperPublishedIndex;
    uint public nextPublishTime;
    uint period;

    function HigherFreq(
        uint _period, 
        address _lowerFreq, 
        address _votes, 
        address _promoted,
        address _contentPool,
        address _doxaToken)
    public
    {
        lowerFreq = DoxaHub(_lowerFreq);
        votes = Votes(_votes);
        promotedContent = PublishedHistory(_promoted);
        contentPool = ContentPool(_contentPool);
        doxaToken = DoxaToken(_doxaToken);

        lowerPublishedIndex = 0;
        upperPublishedIndex = 0;
        period = _period;
        nextPublishTime = now + _period * 1 hours;

        // if (lowerFreq.currentPublishedIndex() > )
        // higherFreqPublishedHistory = PublishedHistory(_publishedHistory)

        // owner = msg.sender;
        // currentCycle and nextCycleChange start off the same
        // currentCycle = -1;
        // nextCycleChange = lowerFreq.currentVersion() + period;
    }


    function backPost(uint32 publishedIndex) 
    public 
    {
        // require(currentCycle >= 0);
        bytes32 ownerKey = keccak256(currentCycle, msg.sender);

        require(votingAvailable(ownerKey));
        require(publishedIndex >= lowerPublishedIndex && publishedIndex < upperPublishedIndex);
        // is there something at this version?

        bytes32 postKey = keccak256(currentCycle, publishedIndex);
        votes.addVote(ownerKey, postKey);
    }

    function votingAvailable(bytes32 _ownerKey)
    view public
    returns (bool) {
        return (votes.outgoingVotes(_ownerKey) < 1);
    }

    function range() 
    public view
    returns (uint32 lower, uint32 upper)
    {
        return (lowerPublishedIndex, upperPublishedIndex);
    }


    // to get all items being voted on
    // call this for every item in (lower, upper)
    function getItem(uint32 publishedIndex) 
    public view
    returns (address poster_, bytes32[8] content_, uint votes_)
    {
        // error: there may be nothing in some publishedIndexs
        bytes32 postKey = keccak256(currentCycle, publishedIndex);
        var (version, index, publishedTime) = lowerFreq.getPublishedCoords(publishedIndex);
        var (poster, content) = contentPool.getPastItem(version, index);
        return (poster, content, votes.incomingVotes(postKey));
    }

    function getPublishedCoords(uint32 publishedIndex) 
    public view
    returns (uint32 version, uint index, uint publishedTime_)
    {
        return promotedContent.getItem(publishedIndex);
    }

    function publish()
    public 
    {
        // require(now > nextPublishTime);

        uint maxVotes = 0;
        uint32 indexToPublish = 0;
        bool somethingSelected = false;

        for (uint32 i = lowerPublishedIndex; i < upperPublishedIndex; i++) {
            bytes32 postKey = keccak256(currentCycle, i);
            if (!somethingSelected || votes.incomingVotes(postKey) > maxVotes) {
                maxVotes = votes.incomingVotes(postKey);
                indexToPublish = i;
                somethingSelected = true;
            }
        }

        if(somethingSelected) {
            // don't like how we call two different methods here
            var (version, index, publishedTime) = lowerFreq.getPublishedCoords(indexToPublish);
            var (poster, content) = contentPool.getPastItem(version, index);
            promotedContent.publish(version, index);
            doxaToken.mint(poster, 1);
            Published(currentCycle, poster, content);
        }

        cycle();

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

    function publishedIndex()
    public view
    returns (uint32)
    {
        return promotedContent.publishedIndex();
    }

    function cycle()
    public 
    {
        // require(now > nextPublishTime);
        // I can use this technique to get rid of the contentPool version from the lower level
        if (lowerPublishedIndex != upperPublishedIndex) {
            lowerPublishedIndex = upperPublishedIndex;
        }
        upperPublishedIndex = lowerFreq.publishedIndex();
        currentCycle += 1;
        nextPublishTime = now + period * 1 hours;
    }

    function getPublishedItem(uint32 publishedIndex) 
    public view
    returns (address poster_, bytes32[8] content_, uint publishedTime_)
    {
        var (version, poolIndex, publishedTime) = promotedContent.getItem(publishedIndex);
        // now we need to convert publishedIndex to version
        var (poster, content) = contentPool.getPastItem(version, poolIndex);
        return (poster, content, publishedTime);
        // return (contentPool.getPastItem(version, poolIndex), publishedTime);
    }
}


// should be able to easily pull the 10 being voted on
// should be able to easily vote on one of these 10
// should be able to publish the top of these 10 to a new publishedhistory 

// should minimize copying state from the lowerfreqs