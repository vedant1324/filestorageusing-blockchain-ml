// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string ipfsHash;
        string timeLocationCoordinates;
        string description;
    }

    mapping(uint256 => File) public files;
    uint256 public fileCount;

    event FileAdded(uint256 indexed fileId, string ipfsHash, string timeLocationCoordinates, string description);

    function addFile(string memory _ipfsHash, string memory _timeLocationCoordinates, string memory _description) public {
        fileCount++;
        files[fileCount] = File(_ipfsHash, _timeLocationCoordinates, _description);
        emit FileAdded(fileCount, _ipfsHash, _timeLocationCoordinates, _description);
    }
}
