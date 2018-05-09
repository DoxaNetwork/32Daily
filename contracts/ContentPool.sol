pragma solidity ^0.4.18;

// import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
// NOTE - what I really want to do is be able to look up by owner - that will have to be done using log filters
import './Spoke.sol';


contract ContentPool is Spoke {

	struct Item 
	{
		address poster;
		bytes32 content;
	}

	uint32 public currentVersion;

	mapping (uint => Item[]) public itemList;
	mapping (bytes32 => uint) public hashIndexMap;

	function ContentPool() 
	public 
	{
		owner = msg.sender;
		currentVersion = 0;
	}

	function newContent(address _poster, bytes32 _content) 
	public onlyHub
	returns (bool) 
	{
		Item memory newItem = Item(
		{
			poster: _poster,
			content: _content
		});

		itemList[currentVersion].push(newItem);

		// todo we don't need this anymore
		bytes32 key = keccak256(currentVersion, _content);
		hashIndexMap[key] = itemList[currentVersion].length-1;

		return true;
	}

	function getItem(uint _index) 
	public view
	returns (address poster, bytes32 content) 
	{
		require(_index < poolLength());
		return (itemList[currentVersion][_index].poster, itemList[currentVersion][_index].content);
	}

	function getIndex(bytes32 _content) 
	public view
	returns (uint) 
	{
		bytes32 key = keccak256(currentVersion, _content);
		return hashIndexMap[key];
	}

	function getPastItem(uint32 _poolVersion, uint _index) 
	public view
	returns (address poster, bytes32 content) 
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
	public
	returns (bool) 
	{
		currentVersion++;
		return true;
	}
}