const mongoose = require("mongoose");
const { mongoURI } = require("./keys");

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(
      mongoURI,
    //   { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("MongoDB successfully connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = { connectToMongoDB };
