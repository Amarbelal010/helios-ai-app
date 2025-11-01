
const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('\nFATAL ERROR: MONGO_URI is not defined in your .env file.');
        console.log('Please create a .env file in the /backend directory and add your MongoDB connection string.');
        console.log('Example: MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/helios?retryWrites=true&w=majority\n');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;