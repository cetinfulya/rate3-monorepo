pragma solidity 0.4.24;

import "./SafeMath.sol";

contract SafeMathMock {

    function mul(uint256 _a, uint256 _b) public pure returns (uint256) {
        return SafeMath.mul(_a, _b);
    }

    function div(uint256 _a, uint256 _b) public pure returns (uint256) {
        return SafeMath.div(_a, _b);
    }

    function sub(uint256 _a, uint256 _b) public pure returns (uint256) {
        return SafeMath.sub(_a, _b);
    }

    function add(uint256 _a, uint256 _b) public pure returns (uint256) {
        return SafeMath.add(_a, _b);
    }

    function mod(uint256 a, uint256 b) public pure returns (uint256) {
        return SafeMath.mod(a, b);
    }
}