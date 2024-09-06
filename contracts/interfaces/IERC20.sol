// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.6.0 <0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
}