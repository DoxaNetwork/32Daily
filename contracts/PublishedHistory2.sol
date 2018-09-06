pragma solidity ^0.4.18;

import './Spoke.sol';


contract PublishedHistory2 is Spoke {

    struct PublishedBlock
    {
        uint32 contentPoolVersion;
        uint contentIndex;
    } 

    uint32 public publishedIndex = 0; // this is equal to publishedBlocks.length
    mapping (uint32 => PublishedBlock) private publishedBlocks;

    // mapping (uint32 => uint32) private poolVersionToIndex;

    function blockLength(uint32 _blockIndex) 
    public view
    returns (uint)
    {
        return 1;
    }

    function getItem(uint32 _blockIndex)
    public view
    returns (uint32 _version, uint _index)
    {
        require(_blockIndex < publishedIndex);
        return (publishedBlocks[_blockIndex].contentPoolVersion, publishedBlocks[_blockIndex].contentIndex);
    }

    function publish(uint32 version, uint index)
    public
    {
        // uint[] content;
        // content.push(index);
        PublishedBlock memory newBlock = PublishedBlock(
        {
            contentPoolVersion: version,
            contentIndex: index
        });
        // newBlock.content.push(index);
        publishedBlocks[publishedIndex] = newBlock;
        publishedIndex += 1;
        // publishedContent[version].push(index);
    }
}