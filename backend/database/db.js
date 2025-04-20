const mongoose = require("mongoose");
// MongoDB connection
const connectDB = async () => {
    try {
      await mongoose.connect(
        'mongodb+srv://filesharingapp:vedant%40123@vedant.jfvpwaf.mongodb.net/filesharing-app?retryWrites=true&w=majority',
        { useNewUrlParser: true, useUnifiedTopology: true }
      );
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB Connection Error:', err);
      process.exit(1); // Exit process with failure
    }
  };


// // Create and save an instance of NumberModel

// const NumberSchema = new mongoose.Schema({
//     value: {
//       type: Number,
//       required: true,
//       default: 25 // Initial value of the number
//     }
//   });

//   const NumberModel = mongoose.model('Number', NumberSchema);

module.exports = connectDB;
