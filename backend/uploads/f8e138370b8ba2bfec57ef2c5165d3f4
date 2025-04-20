const FileStorage = artifacts.require("FileStorage");

module.exports = async function(deployer, network, accounts) {
  try {
    // Deploy the FileStorage contract
    await deployer.deploy(FileStorage);
    const fileStorageInstance = await FileStorage.deployed();

    // Add a file to the deployed contract
    const ipfsHash = "ipfs-hash";
    const coordinates = "coordinates";
    const description = "description";

    // Call the addFile function of the deployed contract
    await fileStorageInstance.addFile(ipfsHash, coordinates, description, { from: accounts[0] });
    console.log("File added successfully");
  } catch (error) {
    console.error("Error deploying contract or adding file:", error);
  }
};

