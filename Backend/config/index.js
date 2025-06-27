// Load environment variables from .env file into process.env
require("dotenv").config();

module.exports = {
    MongoURI: process.env.MONGO_URI,
};
