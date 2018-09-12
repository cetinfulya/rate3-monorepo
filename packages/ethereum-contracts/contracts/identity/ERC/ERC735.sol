pragma solidity 0.4.24;

import "./ERC165.sol";


/**
 * @title ERC735
 * @author Wu Di
 * @notice Abstract contract for ERC735
 */
contract ERC735 is ERC165 {
    /**
     * @dev Constructor that adds ERC735 as a supported interface
     */
    constructor() internal {
        supportedInterfaces[ERC735ID()] = true;
    }

    /**
     * @dev ID for ERC165 pseudo-introspection
     * @return ID for ERC735 interface
     */
    // solhint-disable-next-line func-name-mixedcase
    function ERC735ID() public pure returns (bytes4) {
        return (
            this.getClaim.selector ^
            this.getClaimIdsByTopic.selector ^
            this.addClaim.selector ^
            this.removeClaim.selector
        );
    }

    // Events
    event ClaimRequested(
        uint256 indexed claimRequestId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    event ClaimAdded(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    event ClaimRemoved(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    event ClaimChanged(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    // Functions
    function getClaim(bytes32 _claimId)
        public
        view
        returns(
            uint256 topic,
            uint256 scheme,
            address issuer,
            bytes signature,
            bytes data,
            string uri
        );

    function getClaimIdsByTopic(uint256 topic)
        public
        view
        returns(bytes32[] claimIds);

    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes _signature,
        bytes _data,
        string _uri
    )
        public
        returns (uint256 claimRequestId);

    function removeClaim(bytes32 _claimId)
        public
        returns (bool success);
}
