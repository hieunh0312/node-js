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
const { BadRequestError } = require("../core/error.response");

class AccessService {
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
