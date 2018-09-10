import './DoxaHub.sol';
import './Votes.sol';
import './PublishedHistory.sol';
import './ContentPool.sol';

contract HigherFreq {


    DoxaHub public lowerFreq;
    Votes votes;
    PublishedHistory promotedContent;
    ContentPool contentPool;
    // Votes freq2Votes;
    // PublishedHistory higherFreqPublishedHistory;


    // public uint nextCycleChange;
    uint public currentCycle;
    uint32 lowerPublishedIndex;
    uint32 upperPublishedIndex;
    uint nextPublishTime;

    function HigherFreq(
        uint period, 
        address _lowerFreq, 
        address _votes, 
        address _promoted,
        address _contentPool)
    public
    {
        lowerFreq = DoxaHub(_lowerFreq);
        votes = Votes(_votes);
        promotedContent = PublishedHistory(_promoted);
        contentPool = ContentPool(_contentPool);

        lowerPublishedIndex = 0;
        upperPublishedIndex = 0;
        // nextPublishTime = now + period minutes;

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
        require(publishedIndex >= lowerPublishedIndex && publishedIndex < upperPublishedIndex);
        // is there something at this version?

        bytes32 ownerKey = keccak256(currentCycle, msg.sender);
        bytes32 postKey = keccak256(currentCycle, publishedIndex);
        votes.addVote(ownerKey, postKey);
    }

    function backPosts(uint32[] _postIndexes)
    public 
    {
        for (uint i = 0; i < _postIndexes.length; i++) {
            backPost(_postIndexes[i]);
        }
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
    returns (address poster_, bytes32[5] content_, uint votes_)
    {
        // error: there may be nothing in some publishedIndexs
        bytes32 postKey = keccak256(currentCycle, publishedIndex);
        var (version, index, publishedTime) = lowerFreq.getPublishedCoords(publishedIndex);
        var (poster, content) = contentPool.getPastItem(version, index);
        return (poster, content, votes.incomingVotes(postKey));
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
            var (version, index, publishedTime) = lowerFreq.getPublishedCoords(indexToPublish);
            promotedContent.publish(version, index);
            // timeStamps.stamp(currentVersion); // move timestampes into publishedHistory
            // var (poster, content) = contentPool.getPastItem(currentVersion, indexToPublish);
            // Published(currentVersion, poster, content);
        }

        cycle();

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
    }

    function getPublishedItem(uint32 publishedIndex) 
    public view
    returns (address poster_, bytes32[5] content_, uint publishedTime_)
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