"use strict";

const { SORT_BY } = require("../../constants/sort");
const { unGetSelectData, getSelectData } = require("../../utils");
const discountModel = require("../discount.model");

const findDiscount = async (filter) => {
  return await discountModel.findOne(filter).lean();
};

const findAllDiscountCodesUnselect = async ({
  limit = 50,
  page = 1,
  sort = SORT_BY.CTIME,
  filter,
  unSelect,
  model
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean()
    .exec();

  return documents;
};

const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sort = SORT_BY.CTIME,
  filter,
  select,
  model
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    .exec();

  return documents;
};

module.exports = {
  findDiscount,
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect
};
