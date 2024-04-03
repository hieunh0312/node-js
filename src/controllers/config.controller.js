"use strict";

const { CREATED } = require("../core/success.response");
const { genApiKey } = require("../services/apikey.service");

class ConfigController {
  genApikey = async (req, res, next) => {
    new CREATED({
      message: "Generate API Key Success",
      metadata: await genApiKey()
    }).send(res);
  };
}

module.exports = new ConfigController();
