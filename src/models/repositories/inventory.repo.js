const { Types } = require("mongoose");
const inventoryModel = require("../inventory.model");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unKnown"
}) => {
  return await inventoryModel.create({
    inven_productId: productId,
    inven_stock: stock,
    inven_shopId: new Types.ObjectId(shopId),
    inven_location: location
  });
};

module.exports = {
  insertInventory
};
