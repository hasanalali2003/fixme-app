const express = require("express");
const {
    register,
    login,
    registerDeviceToken,
} = require("../controllers/auth_controller");

const public_users = express.Router();

//Register Endpoint
public_users.post("/register", register);

//Login Endpoint
public_users.post("/login", login);

//Register Device Token Endpoint
public_users.post("/register-token", registerDeviceToken);

module.exports.generals = public_users;
