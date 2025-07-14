const express = require("express");
const {
    register,
    login,
    registerDeviceToken,
    tokenVerfiy,
} = require("../controllers/auth_controller");

const public_users = express.Router();

//Register Endpoint
public_users.post("/register", register);

//Login Endpoint
public_users.post("/login", login);

//Register Device Token Endpoint
public_users.post("/register-token", registerDeviceToken);

//Check token if valid
public_users.post("/verfiy", tokenVerfiy);

module.exports.generals = public_users;
