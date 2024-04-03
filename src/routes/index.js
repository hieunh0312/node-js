"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const { PERMISSION } = require("../constants");
const configController = require("../controllers/config.controller");
const router = express.Router();

router.post("/v1/api/genApiKey", configController.genApikey);

// Check apiKey
router.use(apiKey);

// Check permission
router.use(permission(PERMISSION.DEFAULT));

router.use("/v1/api", require("./access"));
// router.get("/", (req, res, next) => {
//   return res.status(200).json({
//     message: "Hello World",
//   });
// });

module.exports = router;
