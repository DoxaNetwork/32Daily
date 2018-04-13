pragma solidity ^0.4.18;


// open questions
// - do we need any of the getter functions?
// => yes, the getter for the length is required
// => no, a getter is not required to access a public array 
// => no, a getter is not required to access a struct
// - do we need to be able to grab an Item by its content?
// => no, I don't really see a need for that


// - what I really want to do is be able to look up by owner - that will have to be done using log filters


contract ContentPool {

	struct Item {
		uint index;
		address poster;
		string content; // this connects to the hashIndexMap
	}

	// use this to get item by index
	Item[] public itemList;
	// use this to convert key into index
	mapping (bytes32 => uint) public hashIndexMap;

	function newContent(string _content) public 
	returns (bool) {

		Item memory newItem = Item({
			index: itemList.length,
			poster: msg.sender,
			content: _content
		});

		// add the new item to the itemList
		itemList.push(newItem);

		// add the hash key to the hash => index map
		// TODO will the mapping automatically calculate this hash? 
		bytes32 key = sha3(_content);
		hashIndexMap[key] = index;

		return true;
	}

	// TODO this needs permissions
	// TODO where should this money go?
	function clearPool(address _recipient) public
	returns (bool) {

		selfdestruct(_recipient);
	}

	// no need for this yet
	// TODO this needs permissions
	function deleteContent(string _contentToDelete) public 
	returns (bool) {

		bytes32 keyToDelete = sha3(_contentToDelete);
		uint _indexToDelete = hashIndexMap[keyToDelete];

		// update the list
		Item itemToDelete = itemList[_indexToDelete];
		Item itemToMove = itemList[itemList.length-1];
		itemList[_indexToDelete] = itemToMove;
		itemList.length--;
		
		// update the index
		bytes32 keyToMove = sha3(itemToMove.content);
		hashIndexMap[keyToMove] = _indexToDelete;
		delete hashIndexMap[keyToDelete];
		return true;
	}

	// should be able to do this with contract.itemList().length()
	function poolLength() public view 
	returns (uint) {

		return itemList.length;
	}

	// do we need this? => no
	// function itemByIndex(uint _index) public view 
	// 	returns (uint index, address poster, string content) {

	// 	Item item = itemList[_index];
	// 	return (item.index, item.poster, item.content);
	// }

	// do we need this?
	// not really => we will want to access by index and by owner, eventually by tags
	// function itemByContent(string _content) public view
	// 	returns (uint index, address poster, string content) {

	// 	bytes32 key = sha3(_content);
	// 	Item item = hashItemMap[key];
	// 	return (item.index, item.poster, item.content);
	// }
}


// // option 1 -> better for getting items by index
// // use this to get item by index
// Item[] public itemList;
// // use this to convert key to index
// mapping (bytes32 => uint) public hashIndexMap;

// // option 2 -> better for getting items by key
// // use this to get item by key
// mapping (bytes32 => Item) public hashItemMap;
// // use this to convert index to key 
// bytes32[] public itemList;
// this way also requires us to store a uint pointer from the Item to the list