"use strict";

const mongoose = require("mongoose");

const CONNECT_STRING = "mongodb://localhost:3500";

// Connect to MongoDB using Mongoose
mongoose
  .connect("mongodb://localhost")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

module.exports = mongoose;
