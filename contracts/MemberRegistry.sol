pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract MemberRegistry is Ownable {

    struct Member {
        address owner;
        bytes16 name; // up to 16 characters, guaranteed unique
        bytes32 profileIPFS; // this will point to image, blurb, profile, etc
        bool exiled;
    }

    mapping (address => Member) public addressMap;
    mapping (bytes32 => address) public usernameMap;
    mapping (address => address) public proxyMap;

    function create(bytes16 _name, bytes32 _profileIPFS) 
    public
    {
        // make sure this name isn't already taken
        require (usernameMap[_name] == 0); 
        
        Member memory newMember = Member(
        {
            owner: msg.sender,
            name: _name,
            profileIPFS: _profileIPFS,
            exiled: false
        });

        usernameMap[_name] = msg.sender;
        addressMap[msg.sender] = newMember;
    }

    function setProxy(address _newOwner) 
    public 
    {
        require(addressMap[msg.sender].owner > 0);
        proxyMap[_newOwner] = msg.sender;
    }

    function setProfile(bytes32 _profileIPFS)
    public 
    {
        if (proxyMap[msg.sender] > 0) {
            address proxied = proxyMap[msg.sender];
            addressMap[proxied].profileIPFS = _profileIPFS;
        } else {
            addressMap[msg.sender].profileIPFS = _profileIPFS;
        }
    }

    function exile(address _owner)
    public onlyOwner
    {
        if (proxyMap[_owner] > 0) {
            address proxied = proxyMap[_owner];
            addressMap[proxied].exiled = true;
        } else {
            addressMap[_owner].exiled = true;
        }
    }

    function get(address _owner) 
    public view
    returns (address owner_, bytes16 name_, bytes32 profileIPFS_, bool exiled_) 
    {
        if (proxyMap[_owner] > 0) {
            address proxied = proxyMap[_owner];
            return (addressMap[proxied].owner, addressMap[proxied].name, addressMap[proxied].profileIPFS, addressMap[proxied].exiled);
        } else {
            return (addressMap[_owner].owner, addressMap[_owner].name, addressMap[_owner].profileIPFS, addressMap[_owner].exiled);
        }
    }
}

// ability to upgrade without losing data