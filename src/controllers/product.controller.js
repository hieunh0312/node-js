"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductServiceV2 = require("../services/product.service.xxx");
// const ProductService = require("../services/product.service");

class ProductController {
  // POST //
  createProduct = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Create new Product success",
    //   metadata: await ProductService.createProduct(req.body.product_type, {
    //     ...req.body,
    //     product_shop: req.user.userId
    //   })
    // }).send(res);

    new SuccessResponse({
      message: "Create new Product success",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish Product success",
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish Product success",
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res);
  };
  // END POST //

  // QUERY //
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list Draft success",
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list Published success",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search success",
      metadata: await ProductServiceV2.getListSearchProduct(req.params)
    }).send(res);
  };

  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list all products success",
      metadata: await ProductServiceV2.getAllProducts(req.query)
    }).send(res);
  };

  getProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product success",
      metadata: await ProductServiceV2.getProduct({
        product_id: req.params.product_id
      })
    }).send(res);
  };
  // END QUERY //
}

module.exports = new ProductController();
