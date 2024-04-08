"use strict";

const pick = require("lodash/pick");

const getInfoData = ({ fields = [], object = {} }) => pick(object, fields);

const getSelectData = (select = []) =>
  Object.fromEntries(select.map((item) => [item, 1]));

const unGetSelectData = (select = []) =>
  Object.fromEntries(select.map((item) => [item, 0]));

const removeNullOrUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined) delete obj[key];
  });

  return obj;
};

const updateNestedObject = (obj) => {
  const final = {};

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const response = updateNestedObject(obj[key]);

      Object.keys(response).forEach((responseKey) => {
        final[`${key}.${responseKey}`] = response[responseKey];
      });
    } else {
      final[key] = obj[key];
    }
  });

  return final;
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeNullOrUndefinedObject,
  updateNestedObject
};
