"use strict";

const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      // algorithm: "RS256",
      expiresIn: "2 days"
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      // algorithm: "RS256",
      expiresIn: "7 days"
    });

    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.error("Error verify", error);
      } else {
        console.log("Decode", decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("🚀 ~ createTokenPair ~ error:", error);
  }
};

module.exports = {
  createTokenPair
};
