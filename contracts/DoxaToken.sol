pragma solidity ^0.4.24;
 
import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import './SharedSpoke.sol';


contract DoxaToken is StandardToken, SharedSpoke {
    string public name;
    string public symbol;
    uint8 public decimals = 10*18;

    constructor(string _name, string _symbol)
    public
    {
        name = _name;
        symbol = _symbol;
    }

    event Mint(address indexed to, uint amount);
    event Burn(address indexed burner, uint quantity);

    function mint(address _to, uint _quantity) 
    public onlyHubs 
    {
        totalSupply_ = totalSupply_.add(_quantity);
        balances[_to] = balances[_to].add(_quantity);
        emit Mint(_to, _quantity);
        emit Transfer(0x0, _to, _quantity);
    }

    function burn(address _from, uint _quantity)
    public onlyHubs
    {
        require(_from == tx.origin);
        require(_quantity <= balances[_from]);
        totalSupply_ = totalSupply_.sub(_quantity);   
        balances[_from] = balances[_from].sub(_quantity);
        Burn(_from, _quantity);
    }
}