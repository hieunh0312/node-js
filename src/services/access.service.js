"use strict";

const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// node crypto for node-version 19.x
const crypto = require("node:crypto");
const shopModel = require("../models/shop.model");
const KeyTokenServices = require("./keyToken.service");
const { ROLE_SHOP } = require("../constants");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

class AccessService {
  static async login({ email, password, refreshToken = null }) {
    /**
     * 1 - Check email
     * 2 - Match password
     * 3 - Create access token + refresh token and save
     * 4 - gen tokens
     * 5 - get data return login
     */

    // 1.
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not found!");

    // 2.
    const match = bcrypt.compare(password, foundShop.password);
    console.log("🚀 ~ AccessService ~ login ~ match:", match);
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
      console.log("zzzz");

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
