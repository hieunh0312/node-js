const ROLE_SHOP = {
  SHOP: "SHOP",
  ADMIN: "ADMIN",
  WRITER: "WRITER",
  EDITOR: "EDITOR"
};

const PERMISSION = {
  DEFAULT: "0000",
  1: "1111",
  2: "2222"
};
const PERMISSIONS = [PERMISSION.DEFAULT, PERMISSION[1], PERMISSION[2]];

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization"
};

module.exports = {
  HEADER,
  PERMISSION,
  PERMISSIONS,
  ROLE_SHOP
};
