"use strict";

const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    try {
      console.log(`[P]::signUp`, req.body);
      return res.status(201).json(await AccessService.signUp(req.body));
    } catch (error) {
      console.log("🚀 ~ AccessController ~ signUp= ~ error:", error);
      next(error);
    }
  };
}

module.exports = new AccessController();
