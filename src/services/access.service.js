"use strict";

const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// node crypto for node-version 19.x
const crypto = require("node:crypto");
const shopModel = require("../models/shop.model");
const KeyTokenServices = require("./keyToken.service");
const { ROLE_SHOP } = require("../constants");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError
} = require("../core/error.response");
const ShopService = require("./shop.service");

class AccessService {
  static handlerRefreshToken = async (refreshToken) => {
    /**
     *  Check this token used
     */
    const foundToken =
      await KeyTokenServices.findByRefreshTokenUsed(refreshToken);
    if (foundToken) {
      // decode xem user la ai
      const { userId } = await verifyJWT(refreshToken, foundToken.privateKey);

      await KeyTokenServices.deleteKeyById(userId);
      throw new ForbiddenError("Something went wrong! Please login again");
    }

    const holderToken = await KeyTokenServices.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registered");

    // Verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    // Check userId
    const foundShop = await ShopService.findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    // Create new tokens
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokenUsed: refreshToken
      }
    });

    return {
      user: { userId, email },
      tokens
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenServices.removeKeyById(keyStore._id);
    return delKey;
  };

  static async login({ email, password, refreshToken = null }) {
    /**
     * 1 - Check email
     * 2 - Match password
     * 3 - Create access token + refresh token and save
     * 4 - gen tokens
     * 5 - get data return login
     */

    // 1.
    const foundShop = await ShopService.findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not found!");

    // 2.
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    // 3.
    // Created private key, public key
    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    // 4.
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenServices.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop
      }),
      tokens
    };
  }

  static async signUp({ name, email, password }) {
    // step1: check email exists
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [ROLE_SHOP.SHOP]
    });

    if (newShop) {
      // created private key, public key

      // Example: 1
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem"
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem"
      //   }
      // });

      // created token pair

      // const publicKeyObject = crypto.createPublicKey(keyStore);
      // const tokens = await createTokenPair(
      //   { userId: newShop._id, email },
      //   publicKeyObject,
      //   privateKey
      // );

      // Example: 2
      const publicKey = crypto.randomBytes(64).toString("hex");
      const privateKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenServices.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey
      });

      if (!keyStore) {
        throw new BadRequestError("Key store error");
      }

      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop
          }),
          tokens
        }
      };
    }

    return {
      code: 200,
      metadata: null
    };
  }
}

module.exports = AccessService;
