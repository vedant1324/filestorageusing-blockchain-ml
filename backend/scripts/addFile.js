

const FileStorage = artifacts.require("FileStorage");

module.exports = async function(callback) {
  try {
    const fileStorage = await FileStorage.deployed();
    const ipfsHash = process.argv[4]; // Pass IPFS hash as the fourth argument
    const coordinates = process.argv[5]; // Pass coordinates as the fifth argument
    const description = process.argv[6]; // Pass description as the sixth argument
    
    await fileStorage.addFile(ipfsHash, coordinates, description);
    console.log("File added successfully");
  } catch (error) {
    console.error("Error adding file:", error);
  } finally {
    callback();
  }
};
