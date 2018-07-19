pragma solidity ^0.4.18;

import './Spoke.sol';


contract PublishedHistory is Spoke {

    mapping (uint32 => uint[]) private publishedContent;

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