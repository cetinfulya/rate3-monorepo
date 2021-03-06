pragma solidity 0.4.24;

import "../lib/ownership/Claimable.sol";
import "../tokenization/interfaces/ERC20.sol";

contract ConversionReceiver is Claimable {

    ERC20 public token;
    Conversion[] public conversions;

    struct Conversion {
        address ethAddress;
        bytes32 stellarAddress;
        uint256 amount;
        States state;
    }

    enum States {
        INVALID,
        OPEN,
        ACCEPTED,
        REJECTED
    }

    event ConversionRequested(uint256 indexID, address indexed ethAddress, bytes32 stellarAddress, uint256 amount, uint256 requestTimestamp);
    event ConversionRejected(uint256 indexID, address indexed ethAddress, bytes32 stellarAddress, uint256 amount, uint256 rejectTimestamp);
    event ConversionAccepted(uint256 indexID, address indexed ethAddress, bytes32 stellarAddress, uint256 amount, uint256 acceptTimestamp);
    event ConversionUnlocked(address indexed ethAddress, bytes32 stellarAddress, uint256 amount, uint256 unlockTimestamp);

    modifier onlyOpenConversions(uint256 _index) {
        require(conversions[_index].state == States.OPEN, "Conversion should be open");
        _;
    }

    constructor(ERC20 _token) public {
        token = _token;
    }

    function requestConversion(
        uint256 _amount,
        bytes32 _stellarAddress
    )
        public
    {
        uint256 index = conversions.length;

        require(_amount <= token.allowance(msg.sender, address(this)), "Allowance should be set");
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        conversions.push(Conversion(msg.sender, _stellarAddress, _amount, States.OPEN));

        emit ConversionRequested(index, msg.sender, _stellarAddress, _amount, block.timestamp);
    }

    function rejectConversion(uint256 _index) public onlyOwner onlyOpenConversions(_index) {
        Conversion storage conversion = conversions[_index];
        require(token.transfer(conversion.ethAddress, conversion.amount), "Token transfer failed");
        conversion.state = States.REJECTED;

        emit ConversionRejected(_index, conversion.ethAddress, conversion.stellarAddress, conversion.amount, block.timestamp);
    }

    function acceptConversion(uint256 _index) public onlyOwner onlyOpenConversions(_index) {
        Conversion storage conversion = conversions[_index];
        conversion.state = States.ACCEPTED;
        emit ConversionAccepted(_index, conversion.ethAddress, conversion.stellarAddress, conversion.amount, block.timestamp);
    }

    function unlockConversion(
        uint256 _amount,
        address _ethAddress,
        bytes32 _stellarAddress
    )
        public
        onlyOwner
    {
        require(_amount <= token.balanceOf(address(this)), "Not enough tokens to convert");
        require(token.transfer(_ethAddress, _amount), "Token transfer failed");

        emit ConversionUnlocked(_ethAddress, _stellarAddress, _amount, block.timestamp);
    }
}