const { loadModels, getFaceDescriptor, saveUserFace, verifyFace } = require('./faceAuth');


// Test loading models
async function testLoadModels() {
    await loadModels();
    console.log('Models loaded successfully');
}

// Test getting a face descriptor
async function testGetFaceDescriptor(file) {
    const descriptor = await getFaceDescriptor(file);
    console.log('Face Descriptor:', descriptor);
}

// Test storing a user face
async function testSaveUserFace(id, file) {
    const descriptor = await getFaceDescriptor(file);
    if (descriptor) {
        saveUserFace(id, descriptor);
        console.log('User face stored successfully');
    } else {
        console.log('Face not detected');
    }
}

// Test verifying a face
async function testVerifyFace(file) {
    const matchedUserId = await verifyFace(file);
    if (matchedUserId) {
        console.log(`Face recognized as user: ${matchedUserId}`);
    } else {
        console.log('Face not recognized');
    }
}

// Example usage
(async () => {
    await testLoadModels();
    // Call other test functions with actual image files
})();
