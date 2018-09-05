pragma solidity ^0.4.18;
import './Spoke.sol';

contract ContentPool is Spoke {

    struct Item 
    {
        address poster;
        bytes32[5] content;
    }

    uint32 public currentVersion;

    mapping (uint => Item[]) public itemList;
    mapping (bytes32 => uint) public hashIndexMap;

    // number of posts created by each sha3(version,address)
    mapping (bytes32 => uint) internal postCountByPosterVersion;

    function ContentPool() 
    public 
    {
        owner = msg.sender;
        currentVersion = 0;
    }

    function outgoingPosts(address _poster)
    view public
    returns (uint)
    {
        bytes32 posterKey = keccak256(currentVersion, _poster);
        return postCountByPosterVersion[posterKey];
    }

    function newContent(address _poster, bytes32[5] _content)
    public onlyHub
    returns (bool) 
    {
        Item memory newItem = Item(
        {
            poster: _poster,
            content: _content
        });

        itemList[currentVersion].push(newItem);

        bytes32 key = keccak256(currentVersion, _content);
        hashIndexMap[key] = itemList[currentVersion].length-1;

        bytes32 posterKey = keccak256(currentVersion, _poster);
        postCountByPosterVersion[posterKey] += 1;

        return true;
    }

    function getItem(uint _index) 
    public view
    returns (address poster, bytes32[5] content)
    {
        require(_index < poolLength());
        return (itemList[currentVersion][_index].poster, itemList[currentVersion][_index].content);
    }

    function getIndex(bytes32[5] _content)
    public view
    returns (uint) 
    {
        bytes32 key = keccak256(currentVersion, _content);
        return hashIndexMap[key];
    }

    function getPastItem(uint32 _poolVersion, uint _index)
    public view
    returns (address poster, bytes32[5] content)
    {
        return (itemList[_poolVersion][_index].poster, itemList[_poolVersion][_index].content);
    }

    function poolLength() 
    public view 
    returns (uint) 
    {
        return itemList[currentVersion].length;
    }

    function clear() 
    public onlyHub
    returns (bool) 
    {
        currentVersion++;
        return true;
    }
}