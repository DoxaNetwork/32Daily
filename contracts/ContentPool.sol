pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
// NOTE - what I really want to do is be able to look up by owner - that will have to be done using log filters


contract ContentPool is Ownable {

	struct Item 
	{
		address poster;
		bytes32 content;
	}

	uint32 public currentPoolVersion;

	mapping (uint => Item[]) public itemList;
	mapping (bytes32 => uint) public hashIndexMap;

	function ContentPool() public 
	{
		owner = msg.sender;
		currentPoolVersion = 0;
	}

	function newContent(bytes32 _content) public 
	returns (bool) 
	{
		Item memory newItem = Item(
		{
			poster: msg.sender,
			content: _content
		});

		itemList[currentPoolVersion].push(newItem);

		bytes32 key = keccak256(currentPoolVersion, _content);
		hashIndexMap[key] = itemList[currentPoolVersion].length-1;

		return true;
	}

	function getItem(uint index) public view
	returns (address poster, bytes32 content) 
	{
		require(index < poolLength());
		return (itemList[currentPoolVersion][index].poster, itemList[currentPoolVersion][index].content);
	}

	function getIndex(bytes32 _content) public view
	returns (uint) 
	{
		bytes32 key = keccak256(currentPoolVersion, _content);
		return hashIndexMap[key];
	}

	function poolLength() public view 
	returns (uint) 
	{
		return itemList[currentPoolVersion].length;
	}

	function clear() public onlyOwner
	returns (bool) 
	{
		currentPoolVersion++;
		return true;
	}
}