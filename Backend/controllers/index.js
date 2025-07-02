const request_controller = require("./request_controller");
const user_controller = require("./user_controller");
const message_controller = require("./message_controller");

module.exports = {
    ...request_controller,
    ...user_controller,
    ...message_controller,
};
