"use strict";

const mongoose = require("mongoose");

const CONNECT_STRING = "mongodb://localhost:3500";

mongoose
  .connect(CONNECT_STRING)
  .then((_) => console.log("Connected MongoDB"))
  .catch((err) => console.error(err));

// debug
if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
