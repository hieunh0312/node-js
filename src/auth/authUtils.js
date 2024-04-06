"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { HEADER } = require("../constants");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const KeyTokenServices = require("../services/keyToken.service");

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

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1 - Check userId missing ??
   * 2 - Get access token
   * 3 - Verify access token
   * 4 - Check user in dbs
   * 5 - Check keystore with userId
   * 6 - OK all => return next()
   */

  // 1.
  const userId = req.headers[HEADER.CLIENT_ID]?.toString();
  if (!userId) throw new AuthFailureError("Invalid request");

  // 2.
  const keyStore = await KeyTokenServices.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found KeyStore");

  // 3.
  const accessToken = req.headers[HEADER.AUTHORIZATION]?.toString();
  if (!accessToken) throw new AuthFailureError("Invalid request");

  // 4., 5. , 6.
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid userId");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /**
   * 1 - Check userId missing ??
   * 2 - Get access token
   * 3 - Verify access token
   * 4 - Check user in dbs
   * 5 - Check keystore with userId
   * 6 - OK all => return next()
   */

  // 1.
  const userId = req.headers[HEADER.CLIENT_ID]?.toString();
  if (!userId) throw new AuthFailureError("Invalid request");

  // 2.
  const keyStore = await KeyTokenServices.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found KeyStore");

  // 3.
  const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
  if (refreshToken) {
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId)
        throw new AuthFailureError("Invalid userId");
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]?.toString();
  if (!accessToken) throw new AuthFailureError("Invalid request");

  // 4., 5. , 6.
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid userId");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT
};
