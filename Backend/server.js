const express = require("express");
const connect = require("./config/db");
const path = require("path");
const setupSocket = require("./socket");
const cors = require("cors");
const http = require("http");

const general_routes = require("./routes/auth_routes").generals;
const auth_routes = require("./routes/user_routes").authenticated;
const notifi_routes = require("./routes/notification_routes");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT;

//Middleware
app.use(cors());
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

// Setup Socket.IO
setupSocket(server);

server.listen(port, () => {
    console.log("The server is listening to port: ", port);
});
