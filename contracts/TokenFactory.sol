import './DoxaToken.sol';

contract TokenFactory {
    event Deployed(address newContract);

    function newContract()
    public
    returns (address newToken) {
        DoxaToken c = new DoxaToken();
        Deployed(c);
        return address(c);
    }
}