const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB success");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
