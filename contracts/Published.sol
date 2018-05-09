pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract something is Ownable {
	address hubContract;
	mapping (uint32 => uint[]) private publishedContent;

	function something() {
		owner = msg.sender;
	}

	function assignHub(address hubContractAddress) 
	public onlyOwner
	returns (bool)
	{
		hubContract = hubContractAddress;
		return true;
	}

	modifier onlyHub() {
	  require(msg.sender == hubContract);
	  _;
	}

	function blockLength(uint32 _version) 
	public view
	returns (uint)
	{

		return publishedContent[_version].length;
	}

	function getItem(uint32 version, uint index)
	public view
	returns (uint)
	{
		return publishedContent[version][index];
	}

	function publish(uint32 version, uint index)
	public onlyHub
	{
		publishedContent[version].push(index);
	}
}