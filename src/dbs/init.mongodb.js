"use strict";

const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check.connect");
const {
  db: { host, port, name }
} = require("../configs/config.mongodb");
const CONNECT_STRING = `mongodb://${host}:${port}/${name}`;
const MAX_POOL_SIZE = 50;

class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(CONNECT_STRING, {
        maxPoolSize: MAX_POOL_SIZE
      })
      .then((_) => console.log("Connected MongoDB", countConnect()))
      .catch((err) => console.error("Error Connect"));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instance = Database.getInstance();
module.exports = instance;
