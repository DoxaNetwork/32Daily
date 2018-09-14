import './Votes.sol';

contract VotesFactory {
    event Deployed(address newContract);

    function newContract()
    public
    returns (address newVotesDB) {
        Votes v = new Votes();
        Deployed(v);
        return address(v);
    }
}