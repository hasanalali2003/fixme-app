const express = require("express");
const connect = require("./config/db");

const app = express();
const port = process.env.PORT;

app.use(express.json());

// Establish the database connection before starting the server
connect();

app.listen(port, () => {
    console.log("The server is listening to port: ", port);
});
