"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const { PERMISSION } = require("../constants");
const router = express.Router();

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