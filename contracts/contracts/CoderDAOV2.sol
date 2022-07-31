// SPDX-License-Identifier: GNU GPL-3
pragma solidity ^0.8.4;

import "./CoderDAO.sol";

contract CoderDAOV2 is CoderDAO {
    function version() public view virtual override returns (string memory) {
        return "2";
    }
}
