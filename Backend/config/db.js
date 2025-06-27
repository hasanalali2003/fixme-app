const mongoose = require("mongoose");
const { MongoURI } = require(".");

const connect = () => {
    mongoose
        .connect(MongoURI)
        .then(() => {
            console.log("✅ Successfully connected to MongoDB");
        })
        .catch((err) => {
            console.error("❌ Failed to connect to MongoDB:");
            console.error(err);
        });
};

module.exports = connect;
