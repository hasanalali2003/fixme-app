const { Server } = require("socket.io");
const { Message, User, Request } = require("../models/index");
const mongoose = require("mongoose");
const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Join user room
        socket.on("join", ({ userId }) => {
            socket.join(userId);
        });

        // Send message
        socket.on("sendMessage", async (data) => {
            try {
                const {
                    request_id,
                    sender_id,
                    receiver_id,
                    content,
                    type = "Text",
                    attachments,
                } = data;

                // Validate all IDs
                if (!sender_id || !receiver_id || !request_id) {
                    console.warn(
                        "❌ Missing sender_id or receiver_id or request_id"
                    );
                    console.warn("sender_id:", sender_id);
                    console.warn("receiver_id:", receiver_id);
                    return;
                }

                const message = new Message({
                    request_id: new mongoose.Types.ObjectId(`${request_id}`),
                    sender_id: new mongoose.Types.ObjectId(`${sender_id}`),
                    receiver_id: new mongoose.Types.ObjectId(`${receiver_id}`),
                    content,
                    type,
                    attachments,
                    created_at: new Date(),
                });

                await message.save();

                // Emit to receiver
                io.to(receiver_id).emit("newMessage", message);
                io.to(sender_id).emit("messageSent", message);
            } catch (err) {
                console.error("Send Message Error:", err);
            }
        });

        // Assign an agent and delete others
        socket.on("assignAgent", async ({ requestId, assignedAgentId }) => {
            try {
                // Update the request
                await Request.findByIdAndUpdate(requestId, {
                    assigned_to: assignedAgentId,
                });

                // Optionally remove chat history with unassigned agents
                await Message.deleteMany({
                    request_id: requestId,
                    receiver_id: { $ne: assignedAgentId },
                });

                // Notify user and agent
                io.to(assignedAgentId).emit("assigned", { requestId });
                io.emit("agentsUnassigned", {
                    requestId,
                    except: assignedAgentId,
                });
            } catch (err) {
                console.error("Assign Agent Error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

module.exports = setupSocket;
