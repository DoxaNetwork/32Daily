pragma solidity ^0.4.18;

import './Spoke.sol';

contract MemberRegistry is Spoke {

    struct Member {
        bytes32 name;
        address owner;
    }

    // with the mapping, we can have multiple distinct member pools (roles)
    // ( a separate community should have a separate token. each token should have its own membership contract)
    // #0 -> member
    // #1 -> citizen
    // #2 -> senator
    // #3 -> king
    // mapping(uint => Member[]) public memberList;

    Member[] public memberList;

    mapping(address => uint) public addressMap;


    function memberCount() 
    public view
    returns (uint count)
    {
        return memberList.length;
    }

    function createMember(address _owner, bytes32 _name) 
    public onlyHub
    {
        Member memory newMember = Member(
        {
            name: _name,
            owner: _owner
        });

        memberList.push(newMember);

        addressMap[_owner] = memberList.length-1;
    }

    function getMember(uint _index) 
    public view
    returns (bytes32 name_, address owner_)
    {
        return (memberList[_index].name, memberList[_index].owner);
    }

    function getMemberByAddress(address _owner) 
    public view
    returns (bytes32 name_, address owner_) 
    {
        uint index = addressMap[_owner];
        return getMember(index);
    }
}