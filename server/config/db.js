const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const db = process.env.MONGODB_URI;

    await mongoose.connect(db, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log("MongoDB is Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
