pragma solidity ^0.4.18;

import './Spoke.sol';

contract TimeStamps is Spoke {

    mapping (uint32 => uint) private publishingTimeStamps;

    function stamp(uint32 version) 
    public onlyHub 
    {
        publishingTimeStamps[version] = now;
    }

    function getTime(uint32 version)
    public view
    returns (uint)
    {
        return publishingTimeStamps[version];
    }
}