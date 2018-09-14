import './PublishedHistory.sol';

contract HistoryFactory {
    event Deployed(address newContract);

    function newContract()
    public
    returns (address newHistory) {
        PublishedHistory c = new PublishedHistory();
        Deployed(c);
        return address(c);
    }
}