// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentWisdomOracle {
    struct Wisdom {
        address oracle;
        string category;
        string wisdom;
        uint256 timestamp;
        uint256 upvotes;
    }

    mapping(uint256 => Wisdom) public wisdoms;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;
    uint256 public wisdomCount;

    event WisdomShared(
        uint256 indexed id,
        address indexed oracle,
        string category,
        string wisdom,
        uint256 timestamp
    );

    event WisdomUpvoted(uint256 indexed id, address indexed voter, uint256 totalUpvotes);

    function shareWisdom(string calldata category, string calldata wisdom) external {
        wisdoms[wisdomCount] = Wisdom({
            oracle: msg.sender,
            category: category,
            wisdom: wisdom,
            timestamp: block.timestamp,
            upvotes: 0
        });

        emit WisdomShared(wisdomCount, msg.sender, category, wisdom, block.timestamp);

        wisdomCount++;
    }

    function upvoteWisdom(uint256 id) external {
        require(id < wisdomCount, "Wisdom does not exist");
        require(!hasUpvoted[id][msg.sender], "Already upvoted");

        wisdoms[id].upvotes++;
        hasUpvoted[id][msg.sender] = true;

        emit WisdomUpvoted(id, msg.sender, wisdoms[id].upvotes);
    }

    function getWisdom(uint256 id) external view returns (
        address oracle,
        string memory category,
        string memory wisdom,
        uint256 timestamp,
        uint256 upvotes
    ) {
        require(id < wisdomCount, "Wisdom does not exist");
        Wisdom storage w = wisdoms[id];
        return (w.oracle, w.category, w.wisdom, w.timestamp, w.upvotes);
    }

    function getAllWisdoms() external view returns (Wisdom[] memory) {
        Wisdom[] memory allWisdoms = new Wisdom[](wisdomCount);
        for (uint256 i = 0; i < wisdomCount; i++) {
            allWisdoms[i] = wisdoms[i];
        }
        return allWisdoms;
    }

    function getWisdomsByCategory(string calldata category) external view returns (Wisdom[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < wisdomCount; i++) {
            if (keccak256(bytes(wisdoms[i].category)) == keccak256(bytes(category))) {
                count++;
            }
        }

        Wisdom[] memory categoryWisdoms = new Wisdom[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < wisdomCount; i++) {
            if (keccak256(bytes(wisdoms[i].category)) == keccak256(bytes(category))) {
                categoryWisdoms[index] = wisdoms[i];
                index++;
            }
        }

        return categoryWisdoms;
    }

    function getTopWisdoms(uint256 limit) external view returns (Wisdom[] memory) {
        uint256 actualLimit = limit > wisdomCount ? wisdomCount : limit;

        // Create a copy and sort by upvotes (simple bubble sort for small datasets)
        Wisdom[] memory sorted = new Wisdom[](wisdomCount);
        for (uint256 i = 0; i < wisdomCount; i++) {
            sorted[i] = wisdoms[i];
        }

        for (uint256 i = 0; i < wisdomCount - 1; i++) {
            for (uint256 j = 0; j < wisdomCount - i - 1; j++) {
                if (sorted[j].upvotes < sorted[j + 1].upvotes) {
                    Wisdom memory temp = sorted[j];
                    sorted[j] = sorted[j + 1];
                    sorted[j + 1] = temp;
                }
            }
        }

        Wisdom[] memory topWisdoms = new Wisdom[](actualLimit);
        for (uint256 i = 0; i < actualLimit; i++) {
            topWisdoms[i] = sorted[i];
        }

        return topWisdoms;
    }
}
