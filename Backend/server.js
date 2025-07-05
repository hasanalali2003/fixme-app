const express = require("express");
const connect = require("./config/db");
const path = require("path");

const general_routes = require("./routes/auth_routes").generals;
const auth_routes = require("./routes/user_routes").authenticated;
const notifi_routes = require("./routes/notification_routes");

const app = express();
const port = process.env.PORT;

app.use(express.json());

// Serve static files
app.use(
    "/uploads/images",
    express.static(path.join(__dirname, "uploads/images"))
);
app.use(
    "/uploads/voices",
    express.static(path.join(__dirname, "uploads/voices"))
);

// Establish the database connection before starting the server
connect();

// Using routes
app.use("/api/auth", general_routes);
app.use("/api", auth_routes);
app.use("/api/notifications", notifi_routes);

app.listen(port, () => {
    console.log("The server is listening to port: ", port);
});
