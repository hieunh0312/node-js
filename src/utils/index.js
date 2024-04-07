"use strict";

const pick = require("lodash/pick");

const getInfoData = ({ fields = [], object = {} }) => pick(object, fields);

const getSelectData = (select = []) =>
  Object.fromEntries(select.map((item) => [item, 1]));

const unGetSelectData = (select = []) =>
  Object.fromEntries(select.map((item) => [item, 0]));

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData
};
