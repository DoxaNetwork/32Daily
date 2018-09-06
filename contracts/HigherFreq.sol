import './DoxaHub.sol';
import './Votes.sol';
import './PublishedHistory.sol';
import './ContentPool.sol';

contract HigherFreq {


    DoxaHub lowerFreq;
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


    function vote(uint32 publishedIndex) 
    public 
    {
        // require(currentCycle >= 0);
        require(publishedIndex >= lowerPublishedIndex && publishedIndex < upperPublishedIndex);
        // is there something at this version?

        bytes32 ownerKey = keccak256(currentCycle, msg.sender);
        bytes32 postKey = keccak256(currentCycle, publishedIndex);
        votes.addVote(ownerKey, postKey);
    }


    // to get all items being voted on
    // call this for every item in (lower, upper)
    function getItem(uint32 publishedIndex) 
    public view
    returns (address poster_, bytes32[5] content_, uint votes_)
    {
        // error: there may be nothing in some publishedIndexs
        bytes32 postKey = keccak256(currentCycle, publishedIndex);
        var (version, index) = lowerFreq.getPublishedCoords(publishedIndex);
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
            var (version, index) = lowerFreq.getPublishedCoords(indexToPublish);
            promotedContent.publish(version, index);
            // timeStamps.stamp(currentVersion); // move timestampes into publishedHistory
            // var (poster, content) = contentPool.getPastItem(currentVersion, indexToPublish);
            // Published(currentVersion, poster, content);
        }

        cycle();

    }

    function cycle()
    public 
    {
        // require(now > nextPublishTime);
        // I can use this technique to get rid of the contentPool version from the lower level
        if (lowerPublishedIndex != upperPublishedIndex) {
            lowerPublishedIndex = upperPublishedIndex;
        }
        upperPublishedIndex = lowerFreq.currentPublishedIndex() + 1;
        currentCycle += 1;
    }

    function getPublishedItem(uint32 publishedIndex)
    public view
    returns (address poster, bytes32[5] content)
    {
        var (version, poolIndex) = promotedContent.getItem(publishedIndex);
        // now we need to convert publishedIndex to version
        return contentPool.getPastItem(version, poolIndex);
    }
}


// should be able to easily pull the 10 being voted on
// should be able to easily vote on one of these 10
// should be able to publish the top of these 10 to a new publishedhistory 

// should minimize copying state from the lowerfreqs