pragma solidity ^0.4.18;
import './Spoke.sol';

contract ContentPool is Spoke {

    struct Item 
    {
        address poster;
        bytes32 ipfsHash;
    }

    uint32 public currentVersion;

    mapping (uint => Item[]) public itemList;

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

    function newContent(address _poster, bytes32 _ipfsHash)
    public onlyHub
    returns (bool) 
    {
        Item memory newItem = Item(
        {
            poster: _poster,
            ipfsHash: _ipfsHash
        });

        itemList[currentVersion].push(newItem);

        bytes32 posterKey = keccak256(currentVersion, _poster);
        postCountByPosterVersion[posterKey] += 1;

        return true;
    }

    function getItem(uint _index) 
    public view
    returns (address poster, bytes32 ipfsHash)
    {
        require(_index < poolLength());
        return (itemList[currentVersion][_index].poster, itemList[currentVersion][_index].ipfsHash);
    }

    function getPastItem(uint32 _poolVersion, uint _index)
    public view
    returns (address poster, bytes32 ipfsHash)
    {
        return (itemList[_poolVersion][_index].poster, itemList[_poolVersion][_index].ipfsHash);
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